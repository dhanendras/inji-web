import React, {useState} from "react";
import {useNavigate, useParams} from "react-router-dom";
import {useTranslation} from "react-i18next";
import {IoArrowBack, IoCloseCircleSharp} from "react-icons/io5";
import {FaSearch} from "react-icons/fa";
import {useDispatch} from "react-redux";
import {storeCredentials} from "../../redux/reducers/credentialsReducer";
import {api} from "../../utils/api";
import {NavBarProps} from "../../types/components";

import {ApiRequest} from "../../types/data";

export const NavBar: React.FC<NavBarProps> = (props) => {

    const params = useParams<CredentialParamProps>();
    const navigate = useNavigate();
    const {t} = useTranslation("CredentialsPage");
    const dispatch = useDispatch();
    const [searchText, setSearchText] = useState("");

    const filterCredential = async (searchText: string) => {
        setSearchText(searchText)
        const apiRequest: ApiRequest = api.searchCredentialType;
        const response = await props.fetchRequest(
            apiRequest.url(params.issuerId ?? "", searchText),
            apiRequest.methodType,
            apiRequest.headers()
        );
        dispatch(storeCredentials(response?.response?.supportedCredentials))
    }

    return <React.Fragment>
        <div data-testid="NavBar-Outer-Container"
             className="bg-iw-navigationBar text-iw-title p-4 py-10">
            <nav data-testid="NavBar-Inner-Container"
                 className=" mx-auto flex flex-col justify-start container items-start
                             sm:flex-row sm:justify-start sm:items-center">
                <div className="flex items-center my-5 sm:my-0">
                    <div className={"cursor-pointer"}>
                        <IoArrowBack data-testid="NavBar-Back-Arrow" size={24} onClick={() => navigate(props.link)}/>
                    </div>
                    <span data-testid="NavBar-Text"
                          className="text-2xl font-semibold ps-2 whitespace-nowrap">{props.title}</span>
                </div>

                {props.search &&
                    <div className={"flex items-center w-full justify-start sm:justify-end my-5 sm:my-0"} data-testid="NavBar-Search-Container">
                        <div data-testid="Search-Issuer-Container" className="w-full sm:w-96 flex justify-center items-center bg-iw-background shadow-md shadow-iw-shadow rounded-lg">
                            <FaSearch data-testid="NavBar-Search-Icon"
                                      color={'#2899DB'}
                                      className={"m-5"}
                                      size={20}/>
                            <input
                                data-testid="NavBar-Search-Input"
                                type="text"
                                value={searchText}
                                placeholder={t("searchText")}
                                onChange={event => filterCredential(event.target.value)}
                                className="py-6 w-11/12 flex text-iw-searchTitle focus:outline-none "
                            />
                            {searchText.length > 0 && <IoCloseCircleSharp data-testid="NavBar-Search-Clear-Icon"
                                                                          onClick={() => filterCredential("")}
                                                                          color={'var(--iw-color-closeIcon)'}
                                                                          className={"m-5"}
                                                                          size={20}/>}
                        </div>
                    </div>
                }
            </nav>
        </div>
    </React.Fragment>
}
