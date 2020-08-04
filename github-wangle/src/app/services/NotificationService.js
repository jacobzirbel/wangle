"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var NotificationService = /** @class */ (function () {
    function NotificationService(toastr) {
        this.toastr = toastr;
    }
    NotificationService.prototype.success = function (s) {
        //this.toastr.success(s);
    };
    NotificationService.prototype.warning = function (s) {
        //this.toastr.warning(s);
    };
    NotificationService.prototype.error = function (s) {
        //this.toastr.error(s);
    };
    return NotificationService;
}());
exports.NotificationService = NotificationService;
//# sourceMappingURL=NotificationService.js.map