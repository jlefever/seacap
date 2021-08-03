import RepoDto from "./dtos/RepoDto";

export default class Client {
    public getRepos = async (): Promise<RepoDto[]> => {
        return (await fetch("dump/repos.json").then(res => res.json())) as RepoDto[];
    };
};