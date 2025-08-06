const fs = require('fs');
const path = require('path');
const JSZip = require('jszip');
const ignore = require('ignore');
const semver = require('semver');
const chalk = require('chalk'); // Impor chalk

// Fungsi pembantu lainnya tetap sama
function getAllFiles(dirPath, ig, baseDir, arrayOfFiles = []) {
    const files = fs.readdirSync(dirPath);
    files.forEach(function(file) {
        const fullPath = path.join(dirPath, file);
        const relativePath = path.relative(baseDir, fullPath);
        if (ig.ignores(relativePath)) {
            return;
        }
        if (fs.statSync(fullPath).isDirectory()) {
            getAllFiles(fullPath, ig, baseDir, arrayOfFiles);
        } else {
            arrayOfFiles.push(fullPath);
        }
    });
    return arrayOfFiles;
}

function generateContentTypesXml() {
    return `<?xml version="1.0" encoding="utf-8"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="json" ContentType="application/json" /><Default Extension="js" ContentType="application/javascript" /><Default Extension="vsixmanifest" ContentType="text/xml" /></Types>`;
}

function generateVsixManifest(manifest, files) {
    const { publisher, name, version, description, engines } = manifest;
    const identityId = `${publisher}.${name}`;
    const assets = files.map(file => `        <Asset Type="Microsoft.VisualStudio.Code.Engine" Path="extension/${file.replace(/\\/g, '/')}" />`).join('\n');
    return `<?xml version="1.0" encoding="utf-8"?><PackageManifest Version="2.0.0" xmlns="http://schemas.microsoft.com/developer/vsx-schema/2011" xmlns:d="http://schemas.microsoft.com/developer/vsx-schema-details/2011"><Metadata><Identity Id="${identityId}" Version="${version}" Publisher="${publisher}" /><DisplayName>${name}</DisplayName><Description>${description || ''}</Description><Engine><Engines><Engine Name="Microsoft.VisualStudio.Code" Version="${engines.vscode}" /></Engines></Engine></Metadata><Installation><InstallationTarget Id="Microsoft.VisualStudio.Code" /></Installation><Dependencies /><Assets>\n${assets}\n        </Assets></PackageManifest>`;
}

async function createVsixArchive(projectPath, relativeFiles, vsixManifestXml, contentTypesXml) {
    const zip = new JSZip();
    zip.file('[Content_Types].xml', contentTypesXml);
    zip.file('extension.vsixmanifest', vsixManifestXml);
    const extensionFolder = zip.folder('extension');
    for (const file of relativeFiles) {
        const fileContent = fs.readFileSync(path.join(projectPath, file));
        extensionFolder.file(file, fileContent);
    }
    return zip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE', compressionOptions: { level: 9 } });
}

function validateManifest(manifest) {
    const requiredFields = ['name', 'publisher', 'version', 'engines'];
    for (const field of requiredFields) {
        if (!manifest[field]) {
            throw new Error(`Manifest tidak valid: field '${field}' wajib ada di package.json.`);
        }
    }
    if (!manifest.engines.vscode) {
        throw new Error(`Manifest tidak valid: field 'engines.vscode' wajib ada di package.json.`);
    }
    console.log(chalk.green('Manifest valid.'));
}

// Fungsi utama dengan output berwarna
async function packageVsix(argv) {
    try {
        const projectPath = path.resolve(argv.projectPath);
        const outPath = argv.out ? path.resolve(argv.out) : process.cwd();

        console.log(chalk.blue(`Mulai proses pengemasan untuk: ${projectPath}`));
        if (argv.out) console.log(chalk.blue(`Output akan disimpan di: ${outPath}`));

        const manifestPath = path.join(projectPath, 'package.json');
        if (!fs.existsSync(manifestPath)) throw new Error('package.json tidak ditemukan.');

        let manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));

        validateManifest(manifest);

        const incrementLevel = ['patch', 'minor', 'major'].find(level => argv[level]);
        if (incrementLevel) {
            const newVersion = semver.inc(manifest.version, incrementLevel);
            console.log(chalk.yellow(`Menaikkan versi dari ${manifest.version} -> ${newVersion} (${incrementLevel})`));
            manifest.version = newVersion;
            fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + '\n');
            console.log(chalk.yellow('package.json telah diperbarui.'));
        }

        const { name, publisher, version } = manifest;

        const ig = ignore();
        const ignoreFilePath = path.join(projectPath, '.vscodeignore');
        if (fs.existsSync(ignoreFilePath)) {
            console.log(chalk.cyan('Membaca aturan dari .vscodeignore...'));
            const ignoreFileContent = fs.readFileSync(ignoreFilePath, 'utf8');
            ig.add(ignoreFileContent);
        }

        const allProjectFiles = getAllFiles(projectPath, ig, projectPath);
        const relativeFiles = allProjectFiles.map(file => path.relative(projectPath, file));
        const finalFiles = relativeFiles.filter(file => file !== '.vscodeignore');

        console.log(`Ditemukan ${finalFiles.length} file untuk dikemas (setelah filter).`);

        const contentTypesXml = generateContentTypesXml();
        const vsixManifestXml = generateVsixManifest(manifest, finalFiles);

        console.log('Membuat arsip .vsix...');
        const archiveBuffer = await createVsixArchive(projectPath, finalFiles, vsixManifestXml, contentTypesXml);

        const vsixFilename = `${publisher}.${name}-${version}.vsix`;
        const finalOutputPath = path.join(outPath, vsixFilename);
        fs.mkdirSync(outPath, { recursive: true });
        fs.writeFileSync(finalOutputPath, archiveBuffer);

        console.log(chalk.green('\n========================================'));
        console.log(chalk.green.bold(`✅ BERHASIL! File VSIX telah dibuat di:`));
        console.log(chalk.green(finalOutputPath));
        console.log(chalk.green('========================================'));

    } catch (error) {
        // Pesan error sekarang berwarna merah dan lebih menonjol
        console.error(chalk.red('\n========================================'));
        console.error(chalk.red.bold('❌ ERROR:'), chalk.red(error.message));
        console.error(chalk.red('========================================'));
    }
}

module.exports = { packageVsix };
