import ChangeDto from "../dtos/ChangeDto";
import DepDto from "../dtos/DepDto";
import EntityDto from "../dtos/EntityDto";
import RepoDto from "../dtos/RepoDto";
import ChangeBuilder from "./ChangeBuilder";
import DepBuilder from "./DepBuilder";
import EntityBuilder from "./EntityBuilder";
import Repo from "./Repo";

export default class RepoBuilder {
    private readonly _repoDto: RepoDto;
    private readonly _entityDtos: EntityDto[] = [];
    private readonly _changeDtos: ChangeDto[] = [];
    private readonly _depDtos: DepDto[] = [];

    constructor(dto: RepoDto) {
        this._repoDto = dto;
    }

    addEntities(dtos: readonly EntityDto[]): RepoBuilder {
        this._entityDtos.push(...dtos);
        return this;
    }

    addChanges(dtos: readonly ChangeDto[]): RepoBuilder {
        this._changeDtos.push(...dtos);
        return this;
    }

    addDeps(dtos: readonly DepDto[]): RepoBuilder {
        this._depDtos.push(...dtos);
        return this;
    }

    build(): Repo {
        const entities = new EntityBuilder(this._entityDtos).build();

        return {
            id: this._repoDto.id,
            name: this._repoDto.name,
            githubUrl: this._repoDto.githubUrl,
            leadRef: this._repoDto.leadRef,
            entities: Array.from(entities.values()),
            changes: new ChangeBuilder(entities, this._changeDtos).build(),
            deps: new DepBuilder(entities, this._depDtos).build()
        }
    }
}