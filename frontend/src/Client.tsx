import CrsDto from "./dtos/CrsDto";
import CrsSummaryDto from "./dtos/CrsSummaryDto";
import RepoDto from "./dtos/RepoDto";
import UifDto from "./dtos/UifDto";
import UifSummaryDto from "./dtos/UifSummaryDto";

export default class Client {
    public getRepos = async (): Promise<RepoDto[]> => {
        const url = "/dump/repos.json";
        return (await fetch(url).then(res => res.json())) as RepoDto[];
    };

    public getCrsSummaries = async (repoName: string): Promise<CrsSummaryDto[]> => {
        const url = `/dump/${repoName}/crs/index.json`;
        return (await fetch(url).then(res => res.json())) as CrsSummaryDto[];
    };

    public getUifSummaries = async (repoName: string): Promise<UifSummaryDto[]> => {
        const url = `/dump/${repoName}/uif/index.json`;
        return (await fetch(url).then(res => res.json())) as UifSummaryDto[];
    };

    public getCrs = async (repoName: string, num: number): Promise<CrsDto> => {
        const url = `/dump/${repoName}/crs/${num}.json`;
        return (await fetch(url).then(res => res.json())) as CrsDto;
    };

    public getUif = async (repoName: string, num: number): Promise<UifDto> => {
        const url = `/dump/${repoName}/uif/${num}.json`;
        return (await fetch(url).then(res => res.json())) as UifDto;
    };
};