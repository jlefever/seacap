import Client from "./Client";
import RepoBuilder from "./models/RepoBuilder";

const client = new Client();
const repoDto = await client.getRepo("deltaspike");
const entityDtosTask = client.getEntities("deltaspike");
const changeDtosTask = client.getChanges("deltaspike");
const depDtosTask = client.getDeps("deltaspike");

const entityDtos = await entityDtosTask;
const changeDtos = await changeDtosTask;
const depDtos = await depDtosTask;

const repo = new RepoBuilder(repoDto)
    .addEntities(entityDtos)
    .addChanges(changeDtos)
    .addDeps(depDtos)
    .build();

console.log(repo);