#!/usr/bin/env node

const yargs = require('yargs/yargs');
const { hideBin } = require('yargs/helpers');

// Impor fungsi utama dari file packer.js kita yang baru
const { packageVsix } = require('./lib/packer');

// Logika yargs tetap sama, tetapi sekarang ia hanya memanggil fungsi yang diimpor.
yargs(hideBin(process.argv))
    .command('$0 <projectPath>', 'Kemas sebuah direktori ekstensi menjadi file .vsix', (yargs) => {
        yargs
            .positional('projectPath', { describe: 'Path menuju direktori proyek ekstensi', type: 'string' })
            .option('out', { alias: 'o', describe: 'Direktori output untuk menyimpan file .vsix', type: 'string' })
            .option('patch', { describe: 'Naikkan versi patch (x.x.1 -> x.x.2)', type: 'boolean' })
            .option('minor', { describe: 'Naikkan versi minor (x.1.x -> x.2.0)', type: 'boolean' })
            .option('major', { describe: 'Naikkan versi major (1.x.x -> 2.0.0)', type: 'boolean' })
            .conflicts('patch', ['minor', 'major'])
            .conflicts('minor', ['patch', 'major'])
            .conflicts('major', ['patch', 'minor']);
    }, (argv) => {
        // Panggil fungsi yang diimpor dengan argumen dari yargs.
        packageVsix(argv);
    })
    .help()
    .alias('help', 'h')
    .argv;
