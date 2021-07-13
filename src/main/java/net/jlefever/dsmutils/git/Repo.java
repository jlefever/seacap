package net.jlefever.dsmutils.git;

public class Repo {
    private final String url;
    private final String dir;

    public Repo(String url, String dir) {
        this.url = url;
        this.dir = dir;
    }

    public String getUrl() {
        return url;
    }

    public String getDir() {
        return dir;
    }
}
