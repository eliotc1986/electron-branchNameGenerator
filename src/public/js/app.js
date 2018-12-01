import $ from "jquery";
import moment from "moment";
import ClipboardJS from "clipboard";

//
// BranchNameGenerator Class
//

class BranchNameGenerator {
  constructor(element, options) {
    this.$element = element;
    this.options = $.extend(
      true,
      {},
      BranchNameGenerator.defaults,
      this.$element.data(),
      options
    );

    this._init();
  }

  /**
   * Initialize the plugin
   * @private
   */
  _init() {
    this.$inputs = this.$element.find("input, textarea, select");
    this.$outputArea = this.$element.find("[data-output-area]");
    this.$successMsg = this.$element.find("[data-success-msg]");
    this.$form = this.$element.find("[data-form]");

    this._bindEvents();
    this._renderOutputText();
  }

  /**
   * Initialize events for the plugin
   * @private
   */
  _bindEvents() {
    let clipboard = new ClipboardJS("[data-output-area]");

    clipboard.on("success", e => {
      this._renderCopySuccessMsg();
      e.clearSelection();
    });

    if (this.options.validateOn === "fieldChange") {
      this.$inputs.off("change").on("change", e => {
        this._renderOutputText();
      });
    }

    if (this.options.liveValidate) {
      this.$inputs.off("input").on("input", e => {
        this._renderOutputText();
      });
    }

    if (this.options.validateOnBlur) {
      this.$inputs.off("blur").on("blur", e => {
        this._renderOutputText();
      });
    }

    this.$outputArea.on("mouseleave", () => {
      let $msg = this.$successMsg;

      if ($msg.is(":visible")) {
        $msg.fadeOut("fast");
      }
    });
  }

  /**
   * Process data from form
   * @private
   */
  _processData() {
    const data = JSON.parse(JSON.stringify(this.$form.serializeArray()));
    const dateToday = moment().format("MMDYYYY");

    const outputString = data
      .map(form => {
        if (form.name === "description") {
          // Thanks to: https://stackoverflow.com/questions/42215005/get-rid-of-blank-strings-in-split
          let words = form.value.split(" ").filter(val => val);

          return words.join("_") || "xxx";
        } else if (form.name === "ticket_type" && form.value === "hotfix") {
          return `${form.value}_${dateToday}`;
        } else {
          return form.value || "XXX";
        }
      })
      .join("_");

    return outputString;
  }

  /**
   * Render text in outputArea
   * @private
   */
  _renderOutputText() {
    let outputString = this._processData();
    this.$outputArea
      .text(outputString)
      .attr("data-clipboard-text", outputString);
  }

  /**
   * Render success message after copying text to clipboard
   * @private
   */
  _renderCopySuccessMsg() {
    this.$successMsg.fadeIn();
  }

  /**
   * Check if all form inputs are filled-in
   * @function
   * @returns {Boolean} isValid - true if no form inputs are empty
   * Thanks to: https://stackoverflow.com/questions/16211871/how-to-check-if-all-inputs-are-not-empty-with-jquery
   */
  checkFormValidity() {
    let $form = this.$element;

    let isValid =
      $(":input", $form).filter(function() {
        return $.trim($(this).val()).length == 0;
      }).length == 0;

    return isValid;
  }
}

//
// BranchNameGenerator Defaults
//

BranchNameGenerator.defaults = {
  validateOn: "fieldChange",
  liveValidate: false,
  validateOnBlur: false
};

//
// Initialize BranchNameGenerator in DOM
//

$("[data-branch-name-generator]").each(function() {
  new BranchNameGenerator($(this));
});
