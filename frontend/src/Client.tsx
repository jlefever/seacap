import ChangeDto from "./dtos/ChangeDto";
import ClqDto from "./dtos/ClqDto";
import ClqSummaryDto from "./dtos/ClqSummaryDto";
import CrsDto from "./dtos/CrsDto";
import CrsSummaryDto from "./dtos/CrsSummaryDto";
import DepDto from "./dtos/DepDto";
import EntityDto from "./dtos/EntityDto";
import MvpDto from "./dtos/MvpDto";
import MvpSummaryDto from "./dtos/MvpSummaryDto";
import RepoDto from "./dtos/RepoDto";
import UifDto from "./dtos/UifDto";
import UifSummaryDto from "./dtos/UifSummaryDto";

export default class Client {
    public getRepos = async (): Promise<RepoDto[]> => {
        const url = "/dump/repos.json";
        return (await fetch(url).then(res => res.json())) as RepoDto[];
    };

    public getEntityKinds = async (): Promise<string[]> => {
        const url = `/dump/entity_kinds.json`;
        return (await fetch(url).then(res => res.json())) as string[];
    };

    public getDepKinds = async (): Promise<string[]> => {
        const url = `/dump/dep_kinds.json`;
        return (await fetch(url).then(res => res.json())) as string[];
    };

    public getRepo = async (name: string): Promise<RepoDto> => {
        return (await this.getRepos()).filter(r => r.name == name)[0];
    };

    public getCrsSummaries = async (repoName: string): Promise<CrsSummaryDto[]> => {
        const url = `/dump/${repoName}/crs/index.json`;
        return (await fetch(url).then(res => res.json())) as CrsSummaryDto[];
    };

    public getUifSummaries = async (repoName: string): Promise<UifSummaryDto[]> => {
        const url = `/dump/${repoName}/uif/index.json`;
        return (await fetch(url).then(res => res.json())) as UifSummaryDto[];
    };

    public getMvpSummaries = async (repoName: string): Promise<MvpSummaryDto[]> => {
        const url = `/dump/${repoName}/mvp/index.json`;
        return (await fetch(url).then(res => res.json())) as MvpSummaryDto[];
    };

    public getClqSummaries = async (repoName: string): Promise<ClqSummaryDto[]> => {
        const url = `/dump/${repoName}/clq/index.json`;
        return (await fetch(url).then(res => res.json())) as ClqSummaryDto[];
    };

    public getCrs = async (repoName: string, num: number): Promise<CrsDto> => {
        const url = `/dump/${repoName}/crs/${num}.json`;
        return (await fetch(url).then(res => res.json())) as CrsDto;
    };

    public getUif = async (repoName: string, num: number): Promise<UifDto> => {
        const url = `/dump/${repoName}/uif/${num}.json`;
        return (await fetch(url).then(res => res.json())) as UifDto;
    };

    public getMvp = async (repoName: string, num: number): Promise<MvpDto> => {
        const url = `/dump/${repoName}/mvp/${num}.json`;
        return (await fetch(url).then(res => res.json())) as MvpDto;
    };

    public getClq = async (repoName: string, num: number): Promise<ClqDto> => {
        const url = `/dump/${repoName}/clq/${num}.json`;
        return (await fetch(url).then(res => res.json())) as ClqDto;
    };

    public getChanges = async (repoName: string): Promise<ChangeDto[]> => {
        const url = `/dump/${repoName}/changes.json`;
        return (await fetch(url).then(res => res.json())) as ChangeDto[];
    };

    public getDeps = async (repoName: string): Promise<DepDto[]> => {
        const url = `/dump/${repoName}/deps.json`;
        return (await fetch(url).then(res => res.json())) as DepDto[];
    };

    public getEntities = async (repoName: string): Promise<EntityDto[]> => {
        const url = `/dump/${repoName}/entities.json`;
        return (await fetch(url).then(res => res.json())) as EntityDto[];
    };
};