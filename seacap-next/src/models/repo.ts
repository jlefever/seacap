export default interface Repo
{
    name: string;
    displayName: string;
    description: string;
    gitWeb: string | null;
    gitLeadRef: string;
}