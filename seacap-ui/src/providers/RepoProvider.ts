import * as R from "ramda";
import ChangeDto from "../models/ChangeDto";
import DepDto from "../models/DepDto";
import EntityDto from "../models/EntityDto";
import RepoDto from "../models/RepoDto";
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
        const dto = this._dtos!.get(name);

        if (dto === undefined) {
            return null;
        }

        const entityDtosTask = RepoProvider.fetchEntitieDtos(name);
        const changeDtosTask = RepoProvider.fetchChangeDtos(name);
        const depDtosTask = RepoProvider.fetchDepDtos(name);

        const entityDtos = await entityDtosTask;
        const changeDtos = await changeDtosTask;
        const depDtos = await depDtosTask;

        const repo = new RepoBuilder(dto)
            .setEntities(entityDtos)
            .setChanges(changeDtos)
            .setDeps(depDtos)
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
        const url = "/api/repos";
        const dtos = (await fetch(url).then(res => res.json())) as RepoDto[];
        const dict = new Map<string, RepoDto>();
        R.map(d => dict.set(d.name, d), dtos);
        return dict;
    }

    private static async fetchEntitieDtos(repoName: string): Promise<EntityDto[]> {
        const url = `/api/repo/${repoName}/entities`;
        return (await fetch(url).then(res => res.json())) as EntityDto[];
    }

    private static async fetchChangeDtos(repoName: string): Promise<readonly ChangeDto[]> {
        const url = `/api/repo/${repoName}/changes`;
        return (await fetch(url).then(res => res.json())) as ChangeDto[];
    }

    private static async fetchDepDtos(repoName: string): Promise<readonly DepDto[]> {
        const url = `/api/repo/${repoName}/deps`;
        return (await fetch(url).then(res => res.json())) as DepDto[];
    }
}