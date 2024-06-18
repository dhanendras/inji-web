import React from "react";
import {HeaderTileProps} from "../../types/components";

export const HeaderTile: React.FC<HeaderTileProps> = ({content}) => {
    return <React.Fragment>
        <div data-testid="HeaderTile-Text"
             className={"font-bold text-iw-title my-10 text-2xl flex"}>{content}</div>
    </React.Fragment>
}
