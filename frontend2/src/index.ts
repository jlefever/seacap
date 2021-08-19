import RepoProvider from "./providers/RepoProvider";

const repoProvider = new RepoProvider();
// const repo = (await repoProvider.getRepo("deltaspike"))

console.log((await repoProvider.getRepo("deltaspike")) === (await repoProvider.getRepo("deltaspike")));