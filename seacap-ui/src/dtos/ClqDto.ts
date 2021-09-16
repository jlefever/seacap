import ChangeDto from "./ChangeDto";
import ClqSummaryDto from "./ClqSummaryDto";
import DepDto from "./DepDto";
import EntityDto from "./EntityDto";

export default interface ClqDto {
    summary: ClqSummaryDto;
    changes: readonly ChangeDto[];
    entities: readonly EntityDto[];
    deps: readonly DepDto[];
};