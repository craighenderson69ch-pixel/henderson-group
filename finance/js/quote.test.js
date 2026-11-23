#!/usr/bin/env node
"use strict";

var q = require("./quote.js");
var failed = 0;

function assert(cond, msg) {
  if (!cond) {
    failed += 1;
    console.error("FAIL  " + msg);
  } else {
    console.log("ok    " + msg);
  }
}

var data = q.emptyData();
assert(q.validateStep(1, data) && q.validateStep(1, data).loanType, "step 1 requires a loan type");
data.loanType = "business";
assert(q.validateStep(1, data) && q.validateStep(1, data).loanType, "business is not an accepted live type");
data.loanType = "car";
assert(q.validateStep(1, data) === null, "car is a live loan type");

data.amount = "1000";
data.purpose = "New car";
var step2 = q.validateStep(2, data);
assert(step2 && step2.amount, "car amount below minimum is rejected");
data.amount = "25000";
assert(q.validateStep(2, data) === null, "valid car amount and purpose pass");

assert(q.validateStep(3, data) && q.validateStep(3, data).employment, "employment required");
data.employment = "full-time";
data.incomeRange = "80-100k";
assert(q.validateStep(3, data) === null, "employment and income pass");

data.fullName = "Alex Borrower";
data.email = "alex@example.com";
data.mobile = "0412 345 678";
data.postcode = "2000";
data.consent = true;
assert(q.validateStep(4, data) === null, "contact details and consent pass");

data.mobile = "0298765432";
assert(q.validateStep(4, data).mobile, "landline is not accepted as mobile");
data.mobile = "+61412345678";
assert(q.validateStep(4, data) === null, "+61 4 mobile is accepted");

var payload = q.buildPayload(data, "HG-TEST");
assert(payload.amountAud === 25000, "payload amount is numeric AUD");
assert(payload.licensee === "RateMatch", "payload names RateMatch as licensee");
assert(payload.source.indexOf("/finance") !== -1, "payload records /finance as source");
assert(q.RATEMATCH_QUOTE_ENDPOINT === "", "RateMatch endpoint is still the empty placeholder");

q.submitQuote(payload).then(function (res) {
  assert(res.stub === true, "empty endpoint uses the local stub");
  assert(res.ok === true, "stub submit reports ok");
  if (failed) {
    console.error("\n" + failed + " failed");
    process.exit(1);
  }
  console.log("\nall tests passed");
}).catch(function (err) {
  console.error(err);
  process.exit(1);
});
