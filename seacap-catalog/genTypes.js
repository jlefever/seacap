const fs = require("fs");
const { dirname, join } = require("path");
const { compileFromFile } = require("json-schema-to-typescript");

const SCHEMA_DIR = "./schemas";
const OUTPUT_FILE = "./src/generated/dtos.d.ts";

const options = {
    bannerComment: "",
    cwd: SCHEMA_DIR,
    declareExternallyReferenced: false,
    style: {
        bracketSpacing: false,
        printWidth: 80,
        semi: true,
        singleQuote: false,
        tabWidth: 4,
        trailingComma: "none",
        useTabs: false
    }
};

async function generate()
{
    // Delete output file if it exists
    if (fs.existsSync(OUTPUT_FILE))
    {
        fs.rmSync(OUTPUT_FILE);
    }

    // Create containing directory of output file
    fs.mkdirSync(dirname(OUTPUT_FILE), { recursive: true });

    // Iterate through the schemas and append generated code to the output file
    for (const filename of fs.readdirSync(SCHEMA_DIR))
    {
        const filepath = join(SCHEMA_DIR, filename);
        const text = await compileFromFile(filepath, options);
        fs.appendFileSync(OUTPUT_FILE, text + "\n");
    }
}

generate();