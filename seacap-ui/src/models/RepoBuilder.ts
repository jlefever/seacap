import ChangeDto from "./ChangeDto";
import DepDto from "./DepDto";
import EntityDto from "./EntityDto";
import RepoDto from "./RepoDto";
import ChangeBuilder from "./ChangeBuilder";
import DepBuilder from "./DepBuilder";
import EntityBuilder from "./EntityBuilder";
import Repo from "./Repo";

export default class RepoBuilder {
    private readonly _repoDto: RepoDto;
    private _entityDtos: readonly EntityDto[] = [];
    private _changeDtos: readonly ChangeDto[] = [];
    private _depDtos: readonly DepDto[] = [];

    constructor(dto: RepoDto) {
        this._repoDto = dto;
    }

    setEntities(dtos: readonly EntityDto[]): RepoBuilder {
        this._entityDtos = dtos;
        return this;
    }

    setChanges(dtos: readonly ChangeDto[]): RepoBuilder {
        this._changeDtos = dtos;
        return this;
    }

    setDeps(dtos: readonly DepDto[]): RepoBuilder {
        this._depDtos = dtos;
        return this;
    }

    build(): Repo {
        const entities = new EntityBuilder(this._entityDtos).build();

        return {
            name: this._repoDto.name,
            displayName: this._repoDto.displayName,
            description: this._repoDto.description,
            gitWeb: this._repoDto.gitWeb,
            gitLeadRef: this._repoDto.gitLeadRef,
            entities: Array.from(entities.values()),
            changes: new ChangeBuilder(entities, this._changeDtos).build(),
            deps: new DepBuilder(entities, this._depDtos).build()
        }
    }
}