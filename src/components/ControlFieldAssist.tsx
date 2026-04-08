import { InfoHint } from "./InfoHint";

type ControlFieldAssistProps = {
  helper: string;
  detail?: string;
};

export function ControlFieldAssist({
  helper,
  detail,
}: ControlFieldAssistProps) {
  return (
    <div className="control-field__assist">
      <p>{helper}</p>
      {detail ? <InfoHint text={detail} /> : null}
    </div>
  );
}
