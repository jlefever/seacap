export const entityIconFor = (kind: string) => {
    if (kind === "file") {
        return "vs-symbol-file";
    }

    if (kind === "class") {
        return "vs-symbol-class";
    }

    if (kind === "interface") {
        return "vs-symbol-interface";
    }

    if (kind === "method") {
        return "vs-symbol-method";
    }

    if (kind === "field") {
        return "vs-symbol-field";
    }

    if (kind === "enum") {
        return "vs-symbol-enum";
    }

    if (kind === "enumConstant") {
        return "vs-symbol-enum-member";
    }

    return "vs-symbol-misc";
}