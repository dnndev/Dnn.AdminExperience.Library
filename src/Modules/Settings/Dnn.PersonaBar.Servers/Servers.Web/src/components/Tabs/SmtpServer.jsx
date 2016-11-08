import React, { Component, PropTypes } from "react";
import GridSystem from "dnn-grid-system";
import RadioButtonBlock from "../common/RadioButtonBlock";
import EditBlock from "../common/EditBlock";
import SwitchBlock from "../common/SwitchBlock";
import localization from "../../localization";
import Button from "dnn-button";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import SmtpServerTabActions from "../../actions/smtpServerTab";
import utils from "../../utils";

class SmtpServer extends Component {

    componentDidMount() {
        this.props.onRetrieveSmtpServerInfo();
    }

    componentWillReceiveProps(newProps) {
        if (this.props.infoMessage !== newProps.infoMessage && newProps.infoMessage) {
            utils.notify(newProps.infoMessage);
        }

        if (this.props.errorMessage !== newProps.errorMessage && newProps.errorMessage) {
            utils.notifyError(newProps.errorMessage);
        }
    }

    onChangeSmtpServerMode(mode) {
        this.props.onChangeSmtpServerMode(mode);
    }

    onChangeAuthenticationMode(authentication) {
        this.props.onChangeSmtpAuthentication(authentication);
    }

    onChangeSmtpEnableSsl(enabled) {
        this.props.onChangeSmtpConfigurationValue("enableSmtpSsl", enabled);
    }

    onChangeField(key, event) {
        this.props.onChangeSmtpConfigurationValue(key, event.target.value);
    }   

    onSave() {
        const {props} = this;
        const smtpSettings = props.smtpServerInfo.smtpServerMode === "h" && utils.isHostUser() ? props.smtpServerInfo.host 
            : props.smtpServerInfo.site;

        const updateRequest = {
            smtpServerMode: props.smtpServerInfo.smtpServerMode,
            smtpServer: smtpSettings.smtpServer,
            smtpConnectionLimit: smtpSettings.smtpConnectionLimit,
            smtpMaxIdleTime: smtpSettings.smtpMaxIdleTime,
            smtpAuthentication: smtpSettings.smtpAuthentication,
            smtpUsername: smtpSettings.smtpUserName,
            smtpPassword: smtpSettings.smtpPassword,
            enableSmtpSsl: smtpSettings.enableSmtpSsl,
            messageSchedulerBatchSize: props.smtpServerInfo.host.messageSchedulerBatchSize
        };
        props.onUpdateSmtpServerSettings(updateRequest);
    }

    onTestSmtpSettings() {
        const {props} = this;
        let smtpSettings = {};
        if (props.smtpServerInfo.smtpServerMode === "h" && utils.isHostUser()) {
            smtpSettings = props.smtpServerInfo.host;
        }
        if (props.smtpServerInfo.smtpServerMode === "p") {
            smtpSettings = props.smtpServerInfo.site;
        }
        
        const sendEmailRequest = {
            smtpServerMode: props.smtpServerInfo.smtpServerMode,
            smtpServer: smtpSettings.smtpServer,
            smtpAuthentication: smtpSettings.smtpAuthentication,
            smtpUsername: smtpSettings.smtpUserName,
            smtpPassword: smtpSettings.smtpPassword,
            enableSmtpSsl: smtpSettings.enableSmtpSsl
        };
        props.onSendTestEmail(sendEmailRequest);    
    }

    getSmtpServerOptions() {
        return [{
            label: localization.get("GlobalSmtpHostSetting"),
            value: "h"
        },
        {
            label: localization.get("SiteSmtpHostSetting").replace("{0}", "Test site"),
            value: "p"
        }
        ];
    }

    getSmtpAuthenticationOptions() {
        return [{
            label: localization.get("SMTPAnonymous"),
            value: "0"
        },
        {
            label: localization.get("SMTPBasic"),
            value: "1"
        },
        {
            label: localization.get("SMTPNTLM"),
            value: "2"
        }
        ];
    }


    render() {
        const {props} = this;
        const areGlobalSettings = props.smtpServerInfo.smtpServerMode === "h";
        const selectedSmtpSettings = (areGlobalSettings ? props.smtpServerInfo.host : props.smtpServerInfo.site) || {};
        const credentialVisible = selectedSmtpSettings.smtpAuthentication === "1";
        const smtpSettingsVisible = utils.isHostUser() || !areGlobalSettings;

        return <div className="dnn-servers-info-panel-big">
            <GridSystem>
                <div className="leftPane">
                    <div className="tooltipAdjustment border-bottom">
                        <RadioButtonBlock options={this.getSmtpServerOptions()}
                            label={localization.get("plSMTPMode")}
                            tooltip={localization.get("plSMTPMode.Help")}
                            onChange={this.onChangeSmtpServerMode.bind(this)}
                            value={props.smtpServerInfo.smtpServerMode} />
                    </div>
                    <div className="tooltipAdjustment">
                        {smtpSettingsVisible && 
                            <div>
                                <EditBlock label={localization.get("plSMTPServer")}
                                    tooltip={localization.get("plSMTPServer.Help")}
                                    value={selectedSmtpSettings.smtpServer}
                                    isGlobal={areGlobalSettings} 
                                    onChange={this.onChangeField.bind(this, "smtpServer")} />
                        
                                <EditBlock label={localization.get("plConnectionLimit")}
                                    tooltip={localization.get("plConnectionLimit.Help")}
                                    value={selectedSmtpSettings.smtpConnectionLimit} 
                                    isGlobal={areGlobalSettings}
                                    onChange={this.onChangeField.bind(this, "smtpConnectionLimit")} />
                        
                                <EditBlock label={localization.get("plMaxIdleTime")}
                                    tooltip={localization.get("plMaxIdleTime.Help")}
                                    value={selectedSmtpSettings.smtpMaxIdleTime} 
                                    isGlobal={areGlobalSettings}
                                    onChange={this.onChangeField.bind(this, "smtpMaxIdleTime")} />
                            </div>
                        }
                        {smtpSettingsVisible && areGlobalSettings &&
                            <EditBlock label={localization.get("plBatch")}
                                tooltip={localization.get("plBatch.Help")}
                                value={props.smtpServerInfo.host.messageSchedulerBatchSize} 
                                isGlobal={areGlobalSettings}
                                onChange={this.onChangeField.bind(this, "messageSchedulerBatchSize")} />
                        }
                    </div>
                </div>
                <div className="rightPane">
                    {smtpSettingsVisible &&
                        <div className="tooltipAdjustment border-bottom">
                            <RadioButtonBlock options={this.getSmtpAuthenticationOptions()}
                                    label={localization.get("plSMTPAuthentication")}
                                    tooltip={localization.get("plSMTPAuthentication.Help")}
                                    onChange={this.onChangeAuthenticationMode.bind(this)}
                                    value={selectedSmtpSettings.smtpAuthentication || "0"} 
                                    isGlobal={areGlobalSettings} />
                        </div>
                    }
                    <div className="tooltipAdjustment">
                        {smtpSettingsVisible && credentialVisible && 
                            <div>
                                <EditBlock label={localization.get("plSMTPUsername")}
                                    tooltip={localization.get("plSMTPUsername.Help")}
                                    value={selectedSmtpSettings.smtpUserName} 
                                    isGlobal={areGlobalSettings}
                                    onChange={this.onChangeField.bind(this, "smtpUserName")} />                   
                            
                                <EditBlock label={localization.get("plSMTPPassword")}
                                    tooltip={localization.get("plSMTPPassword.Help")}
                                    value={selectedSmtpSettings.smtpPassword} 
                                    isGlobal={areGlobalSettings} 
                                    type="password"
                                    onChange={this.onChangeField.bind(this, "smtpPassword")} />
                            </div>     
                        }
                        {smtpSettingsVisible &&
                        <SwitchBlock label={localization.get("plSMTPEnableSSL")}
                            tooltip={localization.get("plSMTPEnableSSL.Help")}
                            value={selectedSmtpSettings.enableSmtpSsl}
                            onChange={this.onChangeSmtpEnableSsl.bind(this)}
                            isGlobal={areGlobalSettings} />
                        }              
                    </div>
                </div>
            </GridSystem>
            <div className="clear" />
            <div className="buttons-panel">
                 <Button type="secondary"
                    onClick={this.onTestSmtpSettings.bind(this)}>{localization.get("EmailTest")}</Button>
                 <Button type="primary" 
                    onClick={this.onSave.bind(this)}>{localization.get("SaveButtonText")}</Button>
            </div>
        </div>;
    }
}


SmtpServer.propTypes = {   
    smtpServerInfo: PropTypes.object.isRequired,
    errorMessage: PropTypes.string,
    onRetrieveSmtpServerInfo: PropTypes.func.isRequired,
    onChangeSmtpServerMode: PropTypes.func.isRequired,
    onChangeSmtpAuthentication: PropTypes.func.isRequired,
    onChangeSmtpConfigurationValue: PropTypes.func.isRequired,
    onUpdateSmtpServerSettings: PropTypes.func.isRequired,
    infoMessage: PropTypes.string,
    onSendTestEmail: PropTypes.func.isRequired
};

function mapStateToProps(state) {    
    return {
        smtpServerInfo: state.smtpServer.smtpServerInfo,
        errorMessage: state.smtpServer.errorMessage,
        infoMessage: state.smtpServer.infoMessage
    };
}

function mapDispatchToProps(dispatch) {
    return {
        ...bindActionCreators ({
            onRetrieveSmtpServerInfo: SmtpServerTabActions.loadSmtpServerInfo,
            onChangeSmtpServerMode: SmtpServerTabActions.changeSmtpServerMode,
            onChangeSmtpAuthentication: SmtpServerTabActions.changeSmtpAuthentication,
            onChangeSmtpConfigurationValue: SmtpServerTabActions.changeSmtpConfigurationValue,
            onUpdateSmtpServerSettings: SmtpServerTabActions.updateSmtpServerSettings,
            onSendTestEmail: SmtpServerTabActions.sendTestEmail
        }, dispatch)
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(SmtpServer);
