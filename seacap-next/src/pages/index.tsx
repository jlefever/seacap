import RepoList from "components/repoList";
import Repo from "models/repo";
import { GetStaticProps } from "next";
import { getRepos } from "serverutil";

interface HomePageProps
{
    repos: Repo[];
}

const HomePage = ({ repos }: HomePageProps) =>
(
    <div className="ui text container">
        <div className="ui message">
            <h1 className="header">Welcome!</h1>
            <p><abbr title="Software Engineering Artifact">SEA</abbr> Captain helps you refactor problematic code. Select a project below to get started.</p>
        </div>
        <div className="ui hidden divider" />
        <RepoList repos={repos} />
    </div>
);

export const getStaticProps: GetStaticProps = async () =>
{
    return { props: { repos: (await getRepos()) } };
};

export default HomePage;