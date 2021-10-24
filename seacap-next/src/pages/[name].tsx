import Repo from "models/repo";
import { GetStaticPaths, GetStaticProps } from "next";
import { getRepo, getRepos } from "serverutil";

interface RepoPageProps
{
    repo: Repo;
}

const RepoPage = ({ repo }: RepoPageProps) => 
(
    <div className="ui text container">
        <h1 className="ui header">{repo.displayName}</h1>
        <p>{repo.description}</p>
    </div>
);

export const getStaticProps: GetStaticProps = async (context) =>
{
    const name = context.params!["name"];

    if (!name) return { notFound: true };

    const repo = await getRepo(name as string);
    return { props: { repo } };
};

export const getStaticPaths: GetStaticPaths = async () =>
{
    const repos = await getRepos();
    const paths = repos.map(r => ({ params: { name: r.name } }));
    return { paths, fallback: false };
};

export default RepoPage;