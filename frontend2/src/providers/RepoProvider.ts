import * as R from "ramda";
import ChangeDto from "../dtos/ChangeDto";
import DepDto from "../dtos/DepDto";
import EntityDto from "../dtos/EntityDto";
import RepoDto from "../dtos/RepoDto";
import Repo from "../models/Repo";
import RepoBuilder from "../models/RepoBuilder";

export default class RepoProvider {
    private readonly _repos = new Map<string, Repo>();
    private _dtos: Map<string, RepoDto> | undefined = undefined;

    async getRepoDtos() {
        await this.ensureDtos();
        return Array.from(this._dtos!.values());
    }

    async getRepo(name: string) {
        if (this._repos.has(name)) {
            return this._repos.get(name);
        }

        await this.ensureDtos();

        const entityDtosTask = RepoProvider.fetchEntitieDtos(name);
        const changeDtosTask = RepoProvider.fetchChangeDtos(name);
        const depDtosTask = RepoProvider.fetchDepDtos(name);

        const entityDtos = await entityDtosTask;
        const changeDtos = await changeDtosTask;
        const depDtos = await depDtosTask;

        const repo = new RepoBuilder(this._dtos!.get(name)!)
            .addEntities(entityDtos)
            .addChanges(changeDtos)
            .addDeps(depDtos)
            .build();

        this._repos.set(name, repo);
        return repo;
    }

    private async ensureDtos() {
        if (this._dtos === undefined) {
            this._dtos = await RepoProvider.fetchRepoDtos();
        }
    }

    private static async fetchRepoDtos(): Promise<Map<string, RepoDto>> {
        const url = "/dump/repos.json";
        const dtos = (await fetch(url).then(res => res.json())) as RepoDto[];
        const dict = new Map<string, RepoDto>();
        R.map(d => dict.set(d.name, d), dtos);
        return dict;
    }

    private static async fetchEntitieDtos(repoName: string): Promise<EntityDto[]> {
        const url = `/dump/${repoName}/entities.json`;
        return (await fetch(url).then(res => res.json())) as EntityDto[];
    }

    private static async fetchChangeDtos(repoName: string): Promise<readonly ChangeDto[]> {
        const url = `/dump/${repoName}/changes.json`;
        return (await fetch(url).then(res => res.json())) as ChangeDto[];
    }

    private static async fetchDepDtos(repoName: string): Promise<readonly DepDto[]> {
        const url = `/dump/${repoName}/deps.json`;
        return (await fetch(url).then(res => res.json())) as DepDto[];
    }
}