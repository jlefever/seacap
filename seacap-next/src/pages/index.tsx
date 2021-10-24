import RepoList from "components/repoList";
import Repo from "models/repo";
import { GetStaticProps } from "next";
import { getRepos } from "serverutil";
import styled from "styled-components";

interface HomePageProps
{
    repos: Repo[];
}

const Jumbotron = styled.div`
    &&& {
        background-color: #eeeeee;
        box-shadow: none;
        border-radius: 0;
        margin-bottom: 4rem;
        padding-top: 6rem;
        padding-bottom: 4rem;
    }
`;

const HomePage = ({ repos }: HomePageProps) => <>
    <Jumbotron className="ui huge message">
        <div className="ui container">
            <h1 className="ui huge header">Welcome!</h1>
            <p>
                <abbr title="Software Engineering Artifact">SEA</abbr> Captain 
                helps you refactor problematic code. Select a project below to
                get started.
            </p>
            {/* <button className="ui large primary button">Learn more &raquo;</button> */}
        </div>
    </Jumbotron>
    <div className="ui text container">
        <RepoList repos={repos} />
    </div>
</>;

export const getStaticProps: GetStaticProps = async () =>
{
    return { props: { repos: (await getRepos()) } };
};

export default HomePage;