const fs = require( "fs" );
const path = require( "path" );
const lager = require( "properjs-lager" );
const request = require( "request" );
const progress = require( "request-progress" );
const child_process = require( "child_process" );
const headers = {
    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/59.0.3071.115 Safari/537.36"
};
const releaseTag = "master";
const zipFile = path.join( process.cwd(), "boxen.zip" );
const outPath = path.join( process.cwd(), `boxen-${releaseTag}` );
const releaseUrl = `https://github.com/kitajchuk/boxen/archive/${releaseTag}.zip`;
const downloadDelay = 500;



module.exports = ( cli, dir ) => {
    const destPath = dir || process.cwd();

    lager.cache( `Downloading boxen release ${releaseTag}...` );

    return new Promise(( resolve, reject ) => {
        progress( request.get( releaseUrl, { headers } ) )
            .on( "progress", ( state ) => {
                // cli.progress( state.percent );
            })
            .on( "error", ( error ) => {
                reject( error );
            })
            .on( "end", () => {
                lager.cache( `Unpacking release ${releaseTag}...` );

                setTimeout(() => {
                    const unzip = child_process.spawn( "unzip", [zipFile] );

                    unzip.on( "close", () => {
                        lager.cache( `Unpacked release ${releaseTag}!` );
                        lager.cache( "Copying SDK files..." );
                            child_process.execSync( `mv ${outPath}/* ${destPath}` );
                            child_process.execSync( `mv ${outPath}/.eslintrc ${destPath}` );
                            child_process.execSync( `mv ${outPath}/.gitignore ${destPath}` );
                            child_process.execSync( `mv ${outPath}/.npmrc ${destPath}` );
                            child_process.execSync( `mv ${outPath}/.boxen ${destPath}` );
                        lager.cache( "Copied SDK files!" );
                        lager.cache( "Cleaning up temporary files..." );
                            child_process.execSync( `rm -rf ${zipFile}` );
                            child_process.execSync( `rm -rf ${outPath}` );
                            child_process.execSync( `rm -rf ${destPath}/package-lock.json` );

                            resolve();
                    });

                    unzip.stdout.on( "data", ( data ) => {
                        // console.log( data.toString() );
                    });

                    unzip.stderr.on( "data", ( data ) => {
                        // console.log( data.toString() );
                    });

                }, downloadDelay );
            })
            .pipe( fs.createWriteStream( zipFile ) );
    });
};
