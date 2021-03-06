jQuery.sap.declare("com.ffa.hpc.view.settings.Account");
jQuery.sap.require("com.ffa.hpc.util..DateFormatter");
jQuery.sap.require("com.ffa.hpc.util..Collection");

// Provides controller view.Wizard
sap.ui.define(["jquery.sap.global", "com/ffa/hpc/view/settings/Controller"],
  function(jQuery, Controller) {
    "use strict";

    var Account = Controller.extend("com.ffa.hpc.view.settings.Account", /** @lends com.ffa.hpc.view.settings.Account.prototype */ {

    });

    /**
     *
     */
    Account.prototype.onInit = function() {
      // handle route matched
      this.getRouter().getRoute("account").attachPatternMatched(this._onRouteMatched, this);
    };

    /**
     *
     */
    Account.prototype.onExit = function() {};

    /**
     *
     */
    Account.prototype.onBeforeRendering = function() {};

    /**
     *
     */
    Account.prototype.onAfterRendering = function() {};

    /**
     * Route matched handler fires up the Wizard straight away
     */
    Account.prototype._onRouteMatched = function(oEvent) {

      // Let the master list know I'm on this Folders view.
      this.getEventBus().publish("Account", "RouteMatched", {} /* payload */ );

      // Bind this page to the Social Id...
      var oPage = this.getView().byId("idAccountPage");
      oPage.bindElement("profile>/Profiles('TESTUSER')", {
        expand: 'CacheTotal,ForecastCount,CurrentSubscription/Plan',
        select: 'CacheTotal/mb,ForecastCount/count,CurrentSubscription/Plan/data_limit,CurrentSubscription/Plan/forecast_limit'
      });

      // Now bind the forecast count for this month to the object number
      var oNum = this.getView().byId("idForecastCountObjectNumber");
      var oModel = this.getView().getModel("forecast");
      oModel.read("/Forecasts", {
        urlParameters: {
          $select: 'id'
        },
        filters: [new sap.ui.model.Filter({
          path: 'user',
          operator: 'EQ',
          value1: 'TESTUSER'
        }), new sap.ui.model.Filter({
          path: 'month(created)',
          operator: 'EQ',
          value1: new Date(Date.now()).getMonth() + 1 // Months start at 0
        }), new sap.ui.model.Filter({
          path: 'endda',
          operator: 'GT',
          value1: new Date(Date.now())
        })],
        success: function(oData, mResponse) {
          oNum.setNumber(oData.results.length);
        }
      });
    };

    /***
     *    ██████╗ ██╗      █████╗ ███╗   ██╗███████╗
     *    ██╔══██╗██║     ██╔══██╗████╗  ██║██╔════╝
     *    ██████╔╝██║     ███████║██╔██╗ ██║███████╗
     *    ██╔═══╝ ██║     ██╔══██║██║╚██╗██║╚════██║
     *    ██║     ███████╗██║  ██║██║ ╚████║███████║
     *    ╚═╝     ╚══════╝╚═╝  ╚═╝╚═╝  ╚═══╝╚══════╝
     *
     */

    /**
     * User clicked the change plan button. Allow them to select a new plan,
     * for immediate subscription change. User can downgrade, or upgrade. If they
     * are Enterprise user, they cannot change this. If they are not Enterprise user,
     * they cannot select Enterprise
     * @param  {[type]} oEvent [description]
     * @return {[type]}        [description]
     */
    Account.prototype.onChangePlanPress = function(oEvent) {
      // If Enterprise, no changes are allowed
      var oModel = this.getView().getModel("profile");

      // Show prompt to get user action
      var sMessage = "Please note, if your current plan is non-free, your new subscription price (if any) will take effect immediately. All prices are pro-rated to the day. Continue and change your plan?";
      jQuery.sap.require("sap.m.MessageBox");
      sap.m.MessageBox.show(sMessage, {
        icon: sap.m.MessageBox.Icon.INFORMATION,
        title: "Change plan",
        actions: [sap.m.MessageBox.Action.YES, sap.m.MessageBox.Action.NO],
        defaultAction: sap.m.MessageBox.Action.NO,
        initialFocus: sap.m.MessageBox.Action.NO,
        styleClass: (this.getView().getModel("device").getProperty("/isPhone") ? "sapUiSizeCompact" : ""),
        onClose: jQuery.proxy(function(oAction) {
          if (oAction === sap.m.MessageBox.Action.YES) {
            // Otherwise, pull up the plan change screen
            this.getRouter().navTo("change-plan", {}, !sap.ui.Device.system.phone);
          }
        }, this)
      });
    };

    /**
     * True/false is this an enterprise plan
     * @param  {[type]}  oModel [description]
     * @return {Boolean}        [description]
     */
    Account.prototype._isEnterprise = function(oModel) {
      if (!oModel) {
        oModel = this.getView().getModel("profile");
      }

      // Try to determine the Current profile plan type
      var sPlan = oModel.getProperty("/CurrentProfilePlan('TESTUSER')/plan_type_id");
      if (sPlan === undefined) {
        oModel.read("/CurrentProfilePlan('TESTUSER')", {
          async: false,
          success: jQuery.proxy(function(oData, mResponse) {
            sPlan = oData.plan_type_id;
          }, this),
          error: jQuery.proxy(function(mError) {
            this._maybeHandleAuthError(mError);
            sPlan = "";
          }, this)
        });
      }

      // Now return our result
      return sPlan === 'enterprise';
    };

    /***
     *    ████████╗███████╗██████╗ ███╗   ███╗██╗███╗   ██╗ █████╗ ████████╗███████╗
     *    ╚══██╔══╝██╔════╝██╔══██╗████╗ ████║██║████╗  ██║██╔══██╗╚══██╔══╝██╔════╝
     *       ██║   █████╗  ██████╔╝██╔████╔██║██║██╔██╗ ██║███████║   ██║   █████╗
     *       ██║   ██╔══╝  ██╔══██╗██║╚██╔╝██║██║██║╚██╗██║██╔══██║   ██║   ██╔══╝
     *       ██║   ███████╗██║  ██║██║ ╚═╝ ██║██║██║ ╚████║██║  ██║   ██║   ███████╗
     *       ╚═╝   ╚══════╝╚═╝  ╚═╝╚═╝     ╚═╝╚═╝╚═╝  ╚═══╝╚═╝  ╚═╝   ╚═╝   ╚══════╝
     *
     */

    /**
     * User wishes to terminate their account completely. This will cancel
     * their account and billing. If there has been any activity during the month
     * the user will be charged a pro-rated amount, as it appears they are trying
     * to get some services for free.
     * @param  {Event} oEvent Button press
     */
    Account.prototype.onTerminatePress = function(oEvent) {
      // Are you sure?!
      jQuery.sap.require("sap.m.MessageBox");
      sap.m.MessageBox.confirm("This will terminate your account and remove your data. This is irreversible. Continue?", {
        title : "Account termination",
        onClose : jQuery.proxy(this.handleTerminateClose, this),
        textDirection : sap.ui.core.TextDirection.Inherit
      });
    };

    /**
     * Handles close of the termination pop-up. If the user has opted to terminate
     * then we can terminate. If not, close and continue.
     * @param  {Action} oAction pop-up close action
     */
    Account.prototype.handleTerminateClose = function (sAction) {
      // Dependent on the action, process termination.
      if (sAction === sap.m.MessageBox.Action.CANCEL) {
        return;
      }

      // Otherwise, we're deactivating the user.
      // Busy.
      this.showBusyDialog({
        title : "Terminating account",
        text : "Please keep the browser window open until this process concludes",
        showCancelButton : false
      });

      // Submit a job to remove all their data
      this.deleteNodeUser(this.getProfileId());
    };

    /**
     * Now the actual delete. Note, this process doesn't delete the HANA data,
     * just the link from Mongo to HANA. Effectively, the user is orphaned in HANA
     * and we get to retain their data for our purposes.
     * @param  {String} sProfileId Profile ID
     */
    Account.prototype.deleteNodeUser = function (sProfileId) {
      // Call Node to delete the user entry
      jQuery.ajax({
        url: '/auth/delete/',
        type: 'GET',
        headers: this.getJqueryHeaders(),
        async: true,
        success: jQuery.proxy(function(oData, mResponse) {
          // Update the busy dialog
          this.updateBusyDialog({
            text : "Your account has been deleted. Sorry to see you go!"
          });

          // Clear local tokens.
          this.clearBearerToken();
          jQuery.sap.delayedCall(3000, this, function() {

            // nav to login with terminated message
            this.getRouter().navTo("login", {
              reason : "terminated"
            }, !sap.ui.Device.system.phone);

            // hide busy dialog
            this.hideBusyDialog();
          }, []);
        }, this),
        error: jQuery.proxy(function(mError) {
          this.updateBusyDialog({
            text : "There was an error deleting your account. Please reload the app and try again."
          })
          jQuery.sap.delayedCall(3000, this, this.hideBusyDialog, []);
        }, this)
      });
    };
    
    return Account;

  }, /* bExport= */ true);
