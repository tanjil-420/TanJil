const { spawn } = require("child_process");
const log = require("./logger/log.js");

function startProject() {
        const child = spawn("node", ["Goat.js"], {
                cwd: __dirname,
                stdio: "inherit",
                shell: true
        });

        child.on("close", (code) => {
                if (code == 2) {
                        log.info("Restarting Project...");
                        startProject();
                } else if (code == 0) {
                        log.info("Bot process exited normally, restarting...");
                        setTimeout(() => startProject(), 3000); 
                } else {
                        log.info(`Bot process exited with code ${code}, restarting in 5 seconds...`);
                        setTimeout(() => startProject(), 5000);
                }
        });

        child.on("error", (err) => {
                log.error("Failed to start bot process:", err);
                setTimeout(() => startProject(), 5000);
        });
}

startProject();

process.on('SIGTERM', () => {
        log.info('Received SIGTERM, shutting down gracefully...');
        process.exit(0);
});

process.on('SIGINT', () => {
        log.info('Received SIGINT, shutting down gracefully...');
        process.exit(0);
});