package net.jlefever.seacap.ir;

public enum HighResEntityKind {
    FILE("file"),

    ANNOTATION("annotation"),
    CLASS("class"),
    ENUM("enum"),
    INTERFACE("interface"),

    FUNCTION("function"),

    ENUM_CONSTANT("enumConstant"),
    FIELD("field");

    private HighResEntityKind(String name) {
    }

    public LowResEntityKind toLowRes() {
        switch (this) {
            case FILE:
                return LowResEntityKind.FILE;
            case ANNOTATION:
            case CLASS:
            case ENUM:
            case INTERFACE:
                return LowResEntityKind.TYPE;
            case FUNCTION:
                return LowResEntityKind.FUNCTION;
            case ENUM_CONSTANT:
            case FIELD:
                return LowResEntityKind.VAR;
            default:
                throw new IllegalArgumentException();
        }
    }
}
