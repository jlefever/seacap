import ChangeDto from "./ChangeDto";
import UifSummaryDto from "./UifSummaryDto";
import DepDto from "./DepDto";
import EntityDto from "./EntityDto";

export default interface UifDto {
    summary: UifSummaryDto;
    changes: readonly ChangeDto[];
    entities: readonly EntityDto[];
    outDeps: readonly DepDto[];
    evoOutDeps: readonly DepDto[];
};