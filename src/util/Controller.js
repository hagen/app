jQuery.sap.declare("com.ffa.dash.util.Controller");

// Provides controller util.Controller
sap.ui.define(["jquery.sap.global", "sap/ui/core/mvc/Controller"],
  function(jQuery, MvcController) {
    "use strict";

    var Controller = MvcController.extend("com.ffa.dash.util.Controller", /** @lends com.ffa.dash.util.Controller */ {
      _loaded: false
    });

    /**
     * Returns the event bus
     */
    Controller.prototype.getEventBus = function() {
      return this.getOwnerComponent().getEventBus();
    };

    /**
     * Returns the router
     */
    Controller.prototype.getRouter = function() {
      return sap.ui.core.UIComponent.getRouterFor(this);
    };

    /***
     *     █████╗ ██╗   ██╗████████╗██╗  ██╗
     *    ██╔══██╗██║   ██║╚══██╔══╝██║  ██║
     *    ███████║██║   ██║   ██║   ███████║
     *    ██╔══██║██║   ██║   ██║   ██╔══██║
     *    ██║  ██║╚██████╔╝   ██║   ██║  ██║
     *    ╚═╝  ╚═╝ ╚═════╝    ╚═╝   ╚═╝  ╚═╝
     *
     */

    /**
     * Generic auth handler for all Odata requests. If a 401 is returned,
     * user must log in again.
     * @param  {[type]} mError [description]
     * @return {[type]}        [description]
     */
    Controller.prototype._maybeHandleAuthError = function(mError) {
      if ([401, 400].indexOf(mError.response.statusCode) > -1) {
        // SOmetimes, the busy dialog is up when this happens.
        this.hideBusyDialog();

        // and now back to log-in
        this.getRouter().navTo("login", {
          tab: "signin",
          reason: "auth"
        }, !sap.ui.Device.system.phone);
      }
    };

    /**
     * Returns the Node User Id hash, which is stored in the 'user' JSON model
     * on app initialisation.
     * @return {String} User ID from Node
     */
    Controller.prototype.getUserId =
      Controller.prototype.getProfileId = function() {
        var mModel = this.getView().getModel("user");
        return (mModel ? mModel.getProperty("/userid") : "");
      };

    /**
     * Returns the bearer auth token stored in local storage.
     * @return {String} Bearer auth token
     */
    Controller.prototype.getBearerToken = function() {
      var sToken = "";
      if (_token) {
        sToken = _token;
      } else if (window.localStorage) {
        sToken = window.localStorage.getItem('_token');
      } else {
        sToken = "";
      }
      return sToken;
    };

    /**
     * We Use jQuery GET/POST regularly, so let's ensure the header is globally
     * available to all inheriting Controllers.
     * @param {[type]} sToken [description]
     */
    Controller.prototype.getJqueryHeader =
      Controller.prototype.getJqueryHeaders = function(sToken) {
        // Set up GEt request
        return {
          Authorization: 'Bearer ' + this.getBearerToken()
        };
      };

    /**
     * Stores the supplied link token in local storage, so that upon page
     * refresh, it is not lost.
     * @return {String} Link token
     */
    Controller.prototype.getLinkToken = function() {
      if (window.localStorage) {
        return window.localStorage.getItem('_link');
      } else {
        return "";
      }
    };

    /**
     * Removes the previously stored link token.
     */
    Controller.prototype.clearLinkToken = function() {
      if (window.localStorage) {
        window.localStorage.removeItem('_link');
      }
    };
    /***
     *    ███╗   ███╗███████╗████████╗ █████╗ ██████╗  █████╗ ████████╗ █████╗
     *    ████╗ ████║██╔════╝╚══██╔══╝██╔══██╗██╔══██╗██╔══██╗╚══██╔══╝██╔══██╗
     *    ██╔████╔██║█████╗     ██║   ███████║██║  ██║███████║   ██║   ███████║
     *    ██║╚██╔╝██║██╔══╝     ██║   ██╔══██║██║  ██║██╔══██║   ██║   ██╔══██║
     *    ██║ ╚═╝ ██║███████╗   ██║   ██║  ██║██████╔╝██║  ██║   ██║   ██║  ██║
     *    ╚═╝     ╚═╝╚══════╝   ╚═╝   ╚═╝  ╚═╝╚═════╝ ╚═╝  ╚═╝   ╚═╝   ╚═╝  ╚═╝
     *
     */

    /**
     * Function to be called on all route matches that require login/auth.
     * This will check if the metadata model has been loaded, and if not redirect to login.
     * The assumption being that if the meta data model isn't loaded, then
     * the user is not authorised to continue.
     * @param  {String} sModel Model name to check meta data of
     */
    Controller.prototype._checkMetaDataLoaded = function(sModel) {
      if (this._loaded) {
        return;
      }

      // Collect the model matching that supplied.
      var mModel = this.getView().getModel(sModel);

      // If there's a metamodel, all good; if not, back to signin
      if (mModel) {
        if (!mModel.getServiceMetadata()) {
          window.location.href = "/#/login";
        } else {
          this._loaded = true;
        }
      } else {
        throw new Error("Invalid model name");
      }
    };

    /***
     *     █████╗ ██╗     ███████╗██████╗ ████████╗███████╗
     *    ██╔══██╗██║     ██╔════╝██╔══██╗╚══██╔══╝██╔════╝
     *    ███████║██║     █████╗  ██████╔╝   ██║   ███████╗
     *    ██╔══██║██║     ██╔══╝  ██╔══██╗   ██║   ╚════██║
     *    ██║  ██║███████╗███████╗██║  ██║   ██║   ███████║
     *    ╚═╝  ╚═╝╚══════╝╚══════╝╚═╝  ╚═╝   ╚═╝   ╚══════╝
     *
     */

    /**
     * Simple MessageBox error
     */
    Controller.prototype.showErrorAlert = function(sMessage, sTitle, bCompact) {
      jQuery.sap.require("sap.m.MessageBox");
      sap.m.MessageBox.alert(sMessage, {
        icon: sap.m.MessageBox.Icon.ERROR,
        title: (sTitle ? sTitle : "Alert"),
        actions: [sap.m.MessageBox.Action.CLOSE],
        styleClass: bCompact ? "sapUiSizeCompact" : ""
      });
    };

    /**
     * Simple MessageBox info alert
     */
    Controller.prototype.showInfoAlert = function(sMessage, sTitle, bCompact) {
      jQuery.sap.require("sap.m.MessageBox");
      sap.m.MessageBox.show(sMessage, {
        icon: sap.m.MessageBox.Icon.INFORMATION,
        title: (sTitle ? sTitle : "Information"),
        actions: [sap.m.MessageBox.Action.OK],
        styleClass: bCompact ? "sapUiSizeCompact" : ""
      });
    };

    /**
     * Simple MessageBox success alert
     */
    Controller.prototype.showSuccessAlert = function(sMessage, sTitle, bCompact) {
      jQuery.sap.require("sap.m.MessageBox");
      sap.m.MessageBox.show(sMessage, {
        icon: sap.m.MessageBox.Icon.SUCCESS,
        title: (sTitle ? sTitle : "Success"),
        actions: [sap.m.MessageBox.Action.CLOSE],
        styleClass: bCompact ? "sapUiSizeCompact" : ""
      });
    };


    /***
     *    ██████╗ ██╗   ██╗███████╗██╗   ██╗
     *    ██╔══██╗██║   ██║██╔════╝╚██╗ ██╔╝
     *    ██████╔╝██║   ██║███████╗ ╚████╔╝
     *    ██╔══██╗██║   ██║╚════██║  ╚██╔╝
     *    ██████╔╝╚██████╔╝███████║   ██║
     *    ╚═════╝  ╚═════╝ ╚══════╝   ╚═╝
     *
     */

    /**
     * Opens a busy dialog WITH title and text
     * @param  {object} oParams Object of parameters
     */
    Controller.prototype.openBusyDialog =
      Controller.prototype.showBusyDialog = function(oParams) {
        var d = this._oBusyDialog;

        // Create the fragment and open!
        if (!d) {
          d = this._oBusyDialog = sap.ui.xmlfragment("view.BusyDialog", this);
          this.getView().addDependent(d);
        }

        // Set title, text and cancel event
        if (oParams) {
          d.setTitle(oParams.title);
          d.setText(oParams.text);
          if (typeof oParams.onCancel === 'function') {
            d.attachEvent('close', function(oEvent) {
              if (oEvent.getParameter("cancelPressed")) {
                oParams.onCancel();
              }
            });
          }

          // And cancel button?
          if (oParams.showCancelButton === undefined) {
            d.setShowCancelButton(false);
          } else {
            d.setShowCancelButton(oParams.showCancelButton);
          }
        } else {
          d.setTitle("");
          d.setText("");
          d.setShowCancelButton(false);
        }

        // now show the dialog
        d.open();
      };

    /**
     * Updates the open busy dialog with new text.
     * @param  {object} oParams Params containing only text
     */
    Controller.prototype.updateBusyDialog = function(oParams) {
      var d = this._oBusyDialog;
      if (!d) {
        this.showBusyDialog(oParams);
      } else {
        if (oParams.title) {
          d.setTitle(oParams.title);
        }
        if (oParams.text) {
          d.setText(oParams.text);
        }
      }
    };

    /**
     * Closes the busy dialog
     */
    Controller.prototype.closeBusyDialog =
      Controller.prototype.hideBusyDialog = function(oParams) {
        if (this._oBusyDialog) {
          // now show the dialog
          this._oBusyDialog.close();
        }
      };

    /***
     *    ██████╗  █████╗ ████████╗███████╗███████╗
     *    ██╔══██╗██╔══██╗╚══██╔══╝██╔════╝██╔════╝
     *    ██║  ██║███████║   ██║   █████╗  ███████╗
     *    ██║  ██║██╔══██║   ██║   ██╔══╝  ╚════██║
     *    ██████╔╝██║  ██║   ██║   ███████╗███████║
     *    ╚═════╝ ╚═╝  ╚═╝   ╚═╝   ╚══════╝╚══════╝
     *
     */

    /**
     * Returns a utc date
     * @param oDate
     * @returns {Date}
     */
    Controller.prototype._utc = function(oDate) {
      // Remove the time zone component
      var tzOffset = new Date(0).getTimezoneOffset() * 60 * 1000;
      return new Date(oDate.getTime() + tzOffset);
    };

    /**
     * Returns a local date
     * @param oDate
     * @returns {Date}
     */
    Controller.prototype._local = function(oDate) {
      // Remove the time zone component
      var tzOffset = new Date(0).getTimezoneOffset() * 60 * 1000;
      return new Date(oDate.getTime() - tzOffset);
    };

    /**
     * Returns a date with only date components, no time
     * @param oDate
     * @returns {Date}
     */
    Controller.prototype._date = function(oDate) {
      // Remove the time zone component
      return new Date(new Date(oDate).setHours(0));
    };

    /**
     * Returns a date with only date components, no time
     * @param oDate
     * @returns {Date}
     */
    Controller.prototype._string = function(dDate) {
      // If pattern wasn't supplied, use default
      var sPattern = "dd/MM/yyyy";

      // Need SAP formatter
      jQuery.sap.require("sap.ui.core.format.DateFormat");

      // Create the Date Formatter
      var dateFormat = sap.ui.core.format.DateFormat.getDateInstance({
        pattern: sPattern
      });
      return dateFormat.format(new Date(dDate.getTime()));
    };

    /***
     *    ███████╗████████╗ ██████╗ ██████╗  █████╗  ██████╗ ███████╗
     *    ██╔════╝╚══██╔══╝██╔═══██╗██╔══██╗██╔══██╗██╔════╝ ██╔════╝
     *    ███████╗   ██║   ██║   ██║██████╔╝███████║██║  ███╗█████╗
     *    ╚════██║   ██║   ██║   ██║██╔══██╗██╔══██║██║   ██║██╔══╝
     *    ███████║   ██║   ╚██████╔╝██║  ██║██║  ██║╚██████╔╝███████╗
     *    ╚══════╝   ╚═╝    ╚═════╝ ╚═╝  ╚═╝╚═╝  ╚═╝ ╚═════╝ ╚══════╝
     *
     */
    /**
     * [_put description]
     * @param  {[type]} sKey   [description]
     * @param  {[type]} sValue [description]
     * @return {[type]}        [description]
     */
    Controller.prototype._put = function(sKey, sValue) {
      var oStore = new jQuery.sap.storage(jQuery.sap.storage.Type.Local);
      oStore.put(sKey, sValue);
    };

    /**
     * [_get description]
     * @param  {[type]} sKey [description]
     * @return {[type]}      [description]
     */
    Controller.prototype._get = function(sKey) {
      var oStore = new jQuery.sap.storage(jQuery.sap.storage.Type.Local);
      return oStore.get(sKey);
    };

    /***
     *    ██╗   ██╗ █████╗ ██╗     ██╗██████╗  █████╗ ████████╗██╗ ██████╗ ███╗   ██╗
     *    ██║   ██║██╔══██╗██║     ██║██╔══██╗██╔══██╗╚══██╔══╝██║██╔═══██╗████╗  ██║
     *    ██║   ██║███████║██║     ██║██║  ██║███████║   ██║   ██║██║   ██║██╔██╗ ██║
     *    ╚██╗ ██╔╝██╔══██║██║     ██║██║  ██║██╔══██║   ██║   ██║██║   ██║██║╚██╗██║
     *     ╚████╔╝ ██║  ██║███████╗██║██████╔╝██║  ██║   ██║   ██║╚██████╔╝██║ ╚████║
     *      ╚═══╝  ╚═╝  ╚═╝╚══════╝╚═╝╚═════╝ ╚═╝  ╚═╝   ╚═╝   ╚═╝ ╚═════╝ ╚═╝  ╚═══╝
     *
     */

    /**
     * Validate en email
     * @param  {[type]} sEmail [description]
     * @return {[type]}        [description]
     */
    Controller.prototype._validateEmail = function(sEmail) {
      var pattern = /^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/i;

      // Test
      if (sEmail)
        if (pattern.test(sEmail))
          return true;
        else
          return false;
      else
        return false;
    };

    /***
     *     ██████╗ ██████╗ ███╗   ██╗████████╗██████╗  ██████╗ ██╗     ███████╗
     *    ██╔════╝██╔═══██╗████╗  ██║╚══██╔══╝██╔══██╗██╔═══██╗██║     ██╔════╝
     *    ██║     ██║   ██║██╔██╗ ██║   ██║   ██████╔╝██║   ██║██║     ███████╗
     *    ██║     ██║   ██║██║╚██╗██║   ██║   ██╔══██╗██║   ██║██║     ╚════██║
     *    ╚██████╗╚██████╔╝██║ ╚████║   ██║   ██║  ██║╚██████╔╝███████╗███████║
     *     ╚═════╝ ╚═════╝ ╚═╝  ╚═══╝   ╚═╝   ╚═╝  ╚═╝ ╚═════╝ ╚══════╝╚══════╝
     *
     */

     /**
      * Collects the specified control Id from the view
      * @param  {String} sId  Control ID
      * @return {Control}     View control
      */
    Controller.prototype.getControl = function (sId) {
      return this.getView().byId(sId);
    };
  });