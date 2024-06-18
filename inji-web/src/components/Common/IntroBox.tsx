import React from "react";
import {useTranslation} from "react-i18next";

export const IntroBox: React.FC = () => {
    const {t} = useTranslation("HomePage");
    return <React.Fragment>
        <div data-testid="IntroBox-Container" className="text-center pt-5 pb-20 ">
            <h2 data-testid="IntroBox-Text"
                className="text-3xl text-iw-title font-bold">{t("Intro.title")}</h2>
            <p data-testid="IntroBox-SubText"
               className="mt-2 text-lg text-#222222">{t("Intro.subTitle")}</p>
        </div>
    </React.Fragment>
}
