import test from "node:test";
import assert from "node:assert/strict";
import {authRegistrationError,mobileInput,normalizeDigits,personNameInput,identifierInput} from "../src/utils/authValidation";
import {IRAN_PROVINCES,ACTIVITY_FIELDS} from "../src/data/iranLocations";
const p={firstName:"حسین",lastName:"طلبه",mobile:"09123456789",companyName:"صنعت پیش",provinceId:IRAN_PROVINCES[0].id,cityId:IRAN_PROVINCES[0].cities[0].id,activityField:ACTIVITY_FIELDS[0],email:""};
test("valid registration and Persian/Arabic digits",()=>{assert.equal(authRegistrationError(p),null);assert.equal(authRegistrationError({...p,mobile:"۰۹۱۲۳۴۵۶۷۸۹"}),null);assert.equal(normalizeDigits("٠٩١٢٣٤٥٦٧٨٩"),p.mobile);assert.equal(mobileInput("۰۹۱۲a۳۴۵۶۷۸۹!"),p.mobile);});
test("server rejects malformed and oversized mobile numbers",()=>{for(const mobile of ["0912345678","091234567890","08123456789","09abc456789",null])assert.ok(authRegistrationError({...p,mobile}));});
test("names, company and optional email are validated",()=>{for(const fields of [{firstName:"123"},{lastName:"<script>"},{firstName:"a".repeat(51)},{companyName:"x"},{email:"bad@"}])assert.ok(authRegistrationError({...p,...fields}));assert.equal(personNameInput("علی123"),"علی");assert.equal(identifierInput("hossein@۱"),"hossein1");});
test("city must belong to selected province and activity must be known",()=>{assert.ok(authRegistrationError({...p,cityId:IRAN_PROVINCES[1].cities[0].id}));assert.ok(authRegistrationError({...p,activityField:"unlisted"}));});
