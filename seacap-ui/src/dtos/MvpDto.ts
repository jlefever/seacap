import ChangeDto from "./ChangeDto";
import MvpSummaryDto from "./MvpSummaryDto";
import EntityDto from "./EntityDto";

export default interface MvpDto {
    summary: MvpSummaryDto;
    changes: readonly ChangeDto[];
    entities: readonly EntityDto[];
};