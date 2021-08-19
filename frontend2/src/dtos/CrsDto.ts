import ChangeDto from "./ChangeDto";
import CrsSummaryDto from "./CrsSummaryDto";
import DepDto from "./DepDto";
import EntityDto from "./EntityDto";

export default interface CrsDto {
    summary: CrsSummaryDto;
    changes: readonly ChangeDto[];
    entities: readonly EntityDto[];
    outDeps: readonly DepDto[];
    evoOutDeps: readonly DepDto[];
    inDeps: readonly DepDto[];
    evoInDeps: readonly DepDto[];
};