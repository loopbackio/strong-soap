2019-01-22, Version 1.15.0
==========================

 * Adding enforce restrictions option (Romeu Palos de Gouvea)


2018-10-18, Version 1.14.0
==========================

 * Update CODEOWNERS (Raymond Feng)

 * Rename test so it gets run (Jon Roberts)

 * Return error via callback (Jon Roberts)


2018-10-12, Version 1.13.2
==========================

 * changed this.soapActionRequired to boolean (Vineet Jain)

 * Support of sending soapAction in v1.2 (Vineet Jain)


2018-09-24, Version 1.13.1
==========================

 * Add tests to cover maxOccurs (Jon Roberts)

 * Change to isMany logic (Jon Roberts)


2018-09-17, Version 1.13.0
==========================

 * Update ssl key/cert to pass node 10 (Raymond Feng)

 * Update` strong-globalize` to v4.1.1 (Runrioter Wung)

 * Switch to strong-ursa to support Node 10 (Raymond Feng)

 * Add ability to load in a sync way (DomStorey)

 * Add the ability to loadSync (DomStorey)

 * fix code blocks in readme.md with their type (Jiri Spac)

 * fix: use proper variable names (biniam)


2018-08-08, Version 1.12.1
==========================

 * Allow documentation tag under types (Jon Roberts)


2018-08-06, Version 1.12.0
==========================

 * Create client from cached wsdl (Jon Roberts)

 * add forgotten options to soap.listen(...) (Vladimir Latyshev)


2018-07-10, Version 1.11.0
==========================

 * Load a wsdl with no imports from the cache (Jon Roberts)


2018-07-09, Version 1.10.0
==========================

 * [WebFM] cs/pl/ru translation (candytangnb)

 * fix soap-stub example on README.md (Carlos Assis)


2018-05-08, Version 1.9.0
=========================



2018-05-07, Version 1.8.0
=========================

 * feat: add promise support for client operation (shimks)


2018-04-12, Version 1.7.0
=========================

 * fix: add element text value (Raymond Feng)


2018-03-26, Version 1.6.2
=========================

 * fix xsd include/import recursive processing (Raymond Feng)


2018-03-19, Version 1.6.1
=========================

 * fix: add array check for concat (Raymond Feng)

 * build: drop node 4.x support (Raymond Feng)


2018-03-16, Version 1.6.0
=========================

 * fix: improve wsdl types processing for multiple schemas (Raymond Feng)

 * chore: clean up deps (Raymond Feng)


2018-01-31, Version 1.5.0
=========================

 * fix: upgrade deps (Raymond Feng)

 * fix: make sure xml elements are mapped based the order of xsd (Raymond Feng)

 * Fix Typo: RPC Literal (Thomas Richter)

 * check the original passwordDigest method fails against SoapUI output (Tom Hodder)

 * revert formatting changes by format on save in vscode (Tom Hodder)

 * Updated passwordDigest method and related tests (Tom Hodder)

 * missing semi colons (Branden Horiuchi)

 * removed lodash dependency (Branden Horiuchi)

 * added CookieSecurity test (Branden Horiuchi)

 * better cookie parsing handle the case where the header for set-cookie is a string and not an array (Branden Horiuchi)

 * fixing header parse objects would not have been parsed (Branden Horiuchi)

 * added cookie security (Branden Horiuchi)


2018-01-24, Version 1.4.2
=========================

 * fix: handle xsi:type for subtype mappng from json to xml (Raymond Feng)


2018-01-15, Version 1.4.1
=========================

 * make sure attribute descriptors are honored to map json to xml (Raymond Feng)


2018-01-12, Version 1.4.0
=========================

 * allow xsd:include to include a schema without target namespace (Raymond Feng)


2018-01-03, Version 1.3.0
=========================

 * remove node 0.10/0.12 support (Raymond Feng)

 * fix soap version detection (Raymond Feng)

 * Create Issue and PR Templates (#124) (Sakib Hasan)

 * Add CODEOWNER file (Diana Lau)

 * update translation file (Diana Lau)


2017-06-28, Version 1.2.6
=========================

 * removed process.env.PORT (rashmihunt)

 * fix ports (rashmihunt)

 * Fix multiRef merging (Daniel Escoz)

 * travis: expand node version testing (Ryan Graham)

 * test: always run tests with coverage (Ryan Graham)

 * test: replace istanbul with nyc (Ryan Graham)

 * pkg: use src for node 4 instead of transpiling (Ryan Graham)

 * src: enforce strict-mode on all JS (Ryan Graham)


2017-06-14, Version 1.2.5
=========================



2017-06-14, Version 1.2.4
=========================

 * removed old npm-debug.log (rashmihunt)

 * removed before_install (rashmihunt)

 * nillable for complexType (rashmihunt)

 * Remove .DS_Store (Tetsuo Seto)


2017-03-28, Version 1.2.3
=========================

 * Add type information to simpletype (rashmihunt)


2017-03-20, Version 1.2.2
=========================



2017-03-20, Version 1.2.1
=========================

 * Readme changes to use stockquote (rashmihunt)


2017-02-03, Version 1.2.0
=========================

 * more cleanup (crandmck)

 * Regenerate TOC and other cleanup (crandmck)

 * Create README.md (Rand McKinney)

 * Delete Readme.md (Rand McKinney)

 * Create docs.json (Rand McKinney)

 * Fix array loop in operation (rashmihunt)

 * Change capitalization of readme file (crandmck)

 * fix undefined descriptor in attribute (rashmihunt)

 * add stockquote example (rashmihunt)

 * some formating fix (rashmihunt)

 * assign http port dynamically in client-test.js (rashmihunt)

 * incresed timeout for tests (rashmihunt)

 * initialize NTLMSecurity option to wsdl option (rashmihunt)


2016-12-15, Version 1.1.0
=========================

 * fixed a CI failure in downstream (rashmihunt)

 * updated debug statements (rashmihunt)

 * add prettyPrint to client options (rashmihunt)

 * fixed downstream failing test (rashmihunt)

 * fixed a testcase failure (rashmihunt)

 * support forcing soap version (rashmihunt)

 * Update tr translation file (Candy)

 * support  correctly (rashmihunt)

 * Initial support for NTLM (#52) (Rashmi Hunt)

 * Update translation files (Candy)

 * removing CookieSecurity from this branch to keep PR's separate (Branden Horiuchi)

 * adding check for element length on outputBodyDescriptor (Branden Horiuchi)

 * * adding CookieSecurity to built-in security methods (Branden Horiuchi)

 * Add translation files (Candy)

 * added header to input operation (rashmihunt)

 * fix for #31 (rashmihunt)

 * Using targetNamespace of the attribute if present (#32) (Guatom)


2016-10-06, Version 1.0.2
=========================

 * fixed debug level (rashmihunt)

 * debug support & fixed warning (rashmihunt)


2016-09-30, Version 1.0.1
=========================

 * code review fixes (rashmihunt)

 * fixed wsdl-test failure (rashmihunt)

 * add babel script as prepublish (deepakrkris)

 * remove forceSoap12Headers wsdl option and reimplement (rashmihunt)


2016-09-27, Version 1.0.0
=========================

 * Readme updates, cleanup of Examples & code (rashmihunt)

 * Add globalization (Candy)

 * fix for CI build errors (deepakrkris)

 * added code for soap 1.2 fault support, added a new test for soap 1.2 fault, fixed existing test cases (rashmihunt)

 * added support for soap 1.2 fault and added a test case for soap 1.2 fault (rashmihunt)

 * regression for server-test (deepakrkris)

 * regression fixes for wsdl-tests (deepakrkris)

 * fix regression errors for all test cases (deepakrkris)

 * Fixed soap 1.1 Fault path & enabled rest of the tests in wsdl-test.js (rashmihunt)

 * ignoring .DS_Store file (rashmihunt)

 * check soap version for fault processing (rashmihunt)

 * fix test fails for request-response-samples (deepakrkris)

 * Fixed support for imported wsdl scenario, converted wsdl-test.js to mocha test (rashmihunt)

 * Fixed support for Fault, added support for multiple faults in operation, added test cases (rashmihunt)

 * added another set of test casesand fixed issues with server.js and client.js (rashmihunt)

 * fixed rpc path, added rpc/literal test, fixed an issue with wsdl (rashmihunt)

 * fixed rpc path and added a test for rpc/literal style (rashmihunt)

 * Fixed test in ssl-test.js (rashmihunt)

 * enabled last set of tests from server-test.js (rashmihunt)

 * Enabled more tests from server-test.js (rashmihunt)

 * fixed code review comment (rashmihunt)

 * Enabled another set of test cases in server-test.js (rashmihunt)

 * code review fixes - reverted back mapObject change, removed jasonToXML call after parseXML (rashmihunt)

 * Make babel transpliation a pretest script (Raymond Feng)

 * proper header support for client and server (rashmihunt)

 * Fix exported modules (Raymond Feng)

 * derive soapHeader name from it's qname (rashmihunt)

 * fixes for remaining tests to run successfully in client-test.js (rashmihunt)

 * several fixes to enable failing tests in server-options-test and client-test (rashmihunt)

 * 1) Added missing function changeSoapHeader() in base.js and fixed assert logic in 2 tests in client-test.js (rashmihunt)

 * missing selectn module require() statement (rashmihunt)

 * Fixed null arg passing in client._invoke(), fixed server.js logic to derive operationName, outputName and fixed server-options-test to pass srapper oject in the request (rashmihunt)

 * fixed naming convention for module exports in index.js at the top level and added checks for null and undefined (rashmihunt)

 * added WSSecurity to module.export (rashmihunt)

 * Initial test case fixes for feature/wsdl-parser branch changes (rashmihunt)

 * Refactor wsdl parsing into ES6 classes (Raymond Feng)

 * Update README and package.json (Raymond Feng)

 * Fix mustUnderstand value (Raymond Feng)

 * Fix style warnings (Raymond Feng)

 * Mock up stream.destroy for Node 6.x (Raymond Feng)

 * Add nonce and soap:actor options for WSSecurity (Raymond Feng)

 * fixed the soap request envelop generation part when request has complex Type as root. (#849) (Phani Kiran Guttha)

 * gracefully handle errors while parsing xml in xmlToObject and resume the parser with p.resume() (#842) (Deepak Verma)

 * XSD import in WSDL files and relative path (server creation) - resubmit (#846) (Mark Bayfield)

 * Support array of certs for ClientSSLSecurity ca. (#841) (Albert J wong)

 * attribute value of body id in double quotes (#843) (Edwin van Meerendonk)

 * Bumping ursa to 0.9.4 (#836) (Michael)

 * Optionally add Created to wssecurity header (#833) (Jordan Klassen)

 * Clean up brace style (#835) (Jordan Klassen)

 * Fix custom http client not being used when fetching related resources (#834) (Jordan Klassen)

 * Release v0.15.0 (Heinz Romirer)

 * Make ursa an optional dependency. (#832) (Leo Liang)

 * Fix issue of reference element in another namespace. (#831) (Leo Liang)

 * Fix incorrect WSDL in CDATA test case. (#830) (Leo Liang)

 * Mock up cork/uncork to avoid test failure (#829) (Raymond Feng)

 * Fix issue from #787 (Leo Liang)

 * * Adding basic CDATA support. (David)

 * Add missing document about `Client.setEndpoint()` (Leo Liang)

 * Generate TOC in readme file. (Leo Liang)

 * Revert "Undo the changes which are refactoring." (Leo Liang)

 * Fix elementFormDefault handling. (#822) (Leo Liang)

 * Added missing compress node module in package.json (pgAdmin)

 * Add the incoming message object to the client 'response' event (Pattrick Hueper)

 * added note about keep-alive SOAP header workaround (kevincoleman)

 * Update http.js (volkmarbuehringer)

 * Release v0.14.0 (Heinz Romirer)

 * Allows calling methods with callback as last param (Gabriel Montes)

 * Re-enable ignore base namespace option and fixed expected result for its unit test. (eugene-frb)

 * Avoids overwriting request headers with options in method invocation (Gabriel Montes)

 * If {time: true} is passed as an option to request module, makeelapsedTime from response available as Client.lastElapsedTime (brycewjohnson)

 * Allow to set a custom envelop (Baptiste Lecocq)

 * Update soap.js (Liviu Seniuc)

 * Documents custom options and headers on WSDL reqs (Gabriel Montes)

 * Added support for XML rootNode namespace and xmlns definition parser overriding. (Jon Ciccone)

 * ignore whitespace only differences. make differences easier to spot. (CT Arrington)

 * Added support for WSSecurity XML signing with x509 certificates. updated readme updated package.json with latest ursa version change minimum node requirement to 0.10 since many dependencies break with engine-strict=true under node 0.8 (Jon Ciccone)

 * Remove assertions around location of BEGIN CERTIFICATE and END CERTIFICATE (Joseph Junker)

 * Release v0.13.0 (Heinz Romirer)

 * consider previous ignoredNamespaces option when processing includes (BJR Matos)

 * SOAP Headers for server response + a change method for both client & server (Michel D'HOOGE)

 * XML Declaration (Michel D'HOOGE)

 * Fixing wrong nsContext. (Mik13)

 * Adds server options hash example to Readme.md (Benjamin Albert)

 * Children may be empty resulting in a NPE (Tobias Neubert)

 * Releave v0.12.0 (jsdevel)

 * updating lodash to 3.x.x (jsdevel)

 * Fix schema overwrite when include a xsd with <xsd:include> (Leo Liang)

 * Release v0.11.4 (jsdevel)

 * Adding coverage to .travis (jsdevel)

 * Release v0.11.3 (jsdevel)

 * Release v0.11.2 (jsdevel)

 * Closes #733 and Fixes #707: Return null instead of empty object. (jsdevel)

 * Overriding the namespace prefix with empty prefix (SunJang)

 * Adds commas and semicolons to listen(...) example (Benjamin Albert)

 * Temporarily skiping test from #768. (jsdevel)

 * Release v0.11.1 (jsdevel)

 * When a complexType and an element has the same name, and we set the element to a value, the element gets the wrong namespace (a new one, e.g. ns1), because  the `findChildSchemaObject`-function returns the complexType, not the element. (Mik13)

 * improved 'https' pattern matching for local files with name starting with 'http' (Elijah Saounkine)

 * Handles SOAP result null output (Simon Elbaz)

 * Remove SOAPAction http header in SOAP 1.2, extra header was causing some servers to trip (Michael Szlapa)

 * When an error occur, send HTTP 500 status code (Iván López)

 * Adding ClientSSLSecurityPFX for use in requests (Tom Gallacher)

 * Fixed issue when an error was undefined: undefined (Tom Gallacher)

 * Add missing type attribute for PasswordText in WSSecurity and update related tests (wmcmurray)

 * Release v0.11.0 (jsdevel)

 * pass req to service (Evan Tahler)

 * removed console logs (Mike Borozdin)

 * added the ability to add HTTP headers to the client. (Mike Borozdin)

 * Release v0.10.3 (jsdevel)

 * Adding createErroringStub to soap-stub. (jsdevel)

 * Release v0.10.2 (jsdevel)

 * Adding security to soap-stub. (jsdevel)

 * Release v0.10.1 (jsdevel)

 * Adding soap-stub. (jsdevel)

 * add SOAP v1.2 support for client (Aleksey)

 * Release v0.10.0 (jsdevel)

 * Fix xml namespace/element/type handling (Raymond Feng)

 * Release v0.9.5 (jsdevel)

 * Fixes 743, Allow circular XSD files to be loaded (Fabian Cook)

 * Timestamp is now optional (Jason D. Harper)

 * Formatting History.md 0.9.4 notes. (jsdevel)

 * Release v0.9.4 (jsdevel)

 * Adding gitter badge in preparation of disabling issues. (jsdevel)

 * Adding node v4.0 to .travis.yml. (jsdevel)

 * Increasing mocha test timeout to 10 seconds. (jsdevel)

 * Resolve element references when other types are referenced (Raymond Feng)

 * Update Readme.md (Vinay Pulim)

 * Update Readme (laure)

 * add optional statusCode on soap fault (Gangstead)

 * Fix for wsdl retrieval using soap.createClient with special options.httpClient. Before this, the specified client was not used when fetching the wsdl file. This fix will force the wsdl to use the specified httpClient. (Kevin Forest)

 * Release v0.9.3 (jsdevel)

 * Allowing namespace overriding for elements. (jsdevel)

 * Turning off email notifications for travis. (jsdevel)

 * Release v0.9.2 (jsdevel)

 * Add support for xsd element ref (Raymond Feng)

 * Moving travis build to containers. (jsdevel)

 * Add request sample for an operation without any parameters. (Tom De Caluwé)

 * update spelling and formatting to clarify several sections of Readme (Dave Kerr)

 * Add the correct namespace alias for operations without parameters by simply removing the special case where input.parts is empty. If special logic is wanted for this case, it should be contained in objectToRpcXML in any case. (Tom De Caluwé)

 * Prevent sending Object prototype methods as XML (Claudia Hardman)

 * Allow WSDL to be loaded from HTTPS sites (Jimmy Jones)

 * Fix a typo in WSDL#findChildParameterObject (Arthur Schreiber)

 * Fixed SOAP Fault errors not being raised as errors (Ivan Erceg)

 * Use diffrent namespace styles for soap fault 1.1 and 1.2 (Johan Brodin)

 * Release 0.9.1 (herom)

 * fix for empty strings that were returnd as empty json objects (Sasha Vincic)

 * Get current namespace when parent namespace is empty string fixes vpulim/node-soap/issues/533 (Islam Sharabash)

 * Update readme (Raymond Feng)

 * Issue 537: Take namespaces that are configured to be ignored into account (Tobias Neubert)

 * Update license attribute (Peter deHaan)

 * Add ability to customize http client/request lib (Raymond Feng)

 * support xsi:type schema on element (bug #606) (pentode)

 * recursive element should work in wsdl (Semenov, Dmytro())

 * Reformat & Update History.md for v0.9.0 release. (herom)

 * Release v0.9.0 (herom)

 * Make sure wsdl:import is not overwritten by xsd:import (Raymond Feng)

 * Ignore the `.idea` folder when pushing to npm (Arthur Schreiber)

 * Add last endpoint (Ryan Fink)

 * Support for async server errors by extending the callback with one argumnet (Johan Brodin)

 * Handle HTML answer from non-SOAP server (Michel D'HOOGE)

 * Hopefully last review comment fix attempt. (+8 squashed commits) Squashed commits: [e991d38] Still trying to fix review comments. [9627c08] Attempt at fixing review comments... [458ae0e] More review comment fixes. [2152212] Fixing a bunch of things from review comments. [6fb9b10] Fixed a large number of broken tests which were missing schema files. These had previously gone unnoticed because schema imports were not actually firing off. [bfbf338] If response is json, then error should not be thrown. Fix issue #580 [5ddb53f] Removed unnecessary code from testing. [be39fec] Fix to allow request options and headers to persist for all includes. Fix to properly handle when an import/include starts with a schema element. (Barry Dutton)

 * Do not end request for keep-alive connections (mgorczyca)

 * Client 'response' event (briandunnington)

 * If response is json, then error should not be thrown. Fix issue #580 (Himanshu Kansal)

 * sub namespace should be correct regardless of order of enumeration i.e. should not be overriden by other prop's namespace (Yang)

 * Read Me: Added a section about Server Events (Michel D'HOOGE)

 * Server 'request' event (Michel D'HOOGE)

 * Add support for One-Way Operations (Wim verreydt)

 * The extend function was throwing an error (#585). This null and typeof check will handle elements that are not objects. (z151514)

 * ClientSSLSecurity now accepts a `ca`-certificate. (Mik13)

 * ClientSSLSecurity should be able to take a Buffer as `key` and `cert` parameter. Additionally the certificates are checked whether they are correct or not (starting with `-----BEGIN`). (Mik13)

 * Add support for sending NULL values (Chase Sillevis)

 * Follow 302 redirects, don't mix quotes (Chase Sillevis)

 * Update CONTRIBUTING.md (Heinz Romirer)

 * Respond with security timestamp if request had one (Roie Kossover)

 * Release v0.8.0 (herom)

 * Fix strict mode errors for v0.12 compatibility (Andrew Branch)

 * Issue #386 This fix adds support for attributes in node body (Robert)

 * Update History.md (Heinz Romirer)

 * Release v0.7.0 (herom)

 * Server event to globally handle SOAP Headers (Michel D'HOOGE)

 * Server replies with SOAP Fault thrown from method (Michel D'HOOGE)

 * fix for issue #68. Fix the case where requests are in soap format and… … (Himanshu Kansal)

 * Added `['positiveInteger', 'nonPositiveInteger', 'negativeInteger', 'nonNegativeInteger']` to primitive types. (Anil Anar)

 * Client instances emit 'soapError' event when error is detected (Michel D'HOOGE)

 * Respect empty soap actions in operations (Akash Agrawal)

 * Add support for message and request events as per issue #545 (Evan Shortiss)

 * Issue #489: Soap header from incoming request (Michel D'HOOGE)

 * Added support for CDATA with text and CDATA with XML response (whoover)

 * Return the soapHeader (nguyenchr)

 * Allow logging of received XML prior to parsing and processing (Deividy Metheler)

 * add support for importing external wsdl (yuerwei)

 * Use correct namespaces for elements which consist of an array. (Mik13)

 * Use correct namespaces in for elements with base. (Mik13)

 * preventing error when typeElement is undefined (Antonio Terreno)

 * Fix typo in header, breaking heading. (Albert Engelbrecht)

 * Allow wsdl:documentation element under wsdl:message (Raymond Feng)

 * Added functionality to ignore default tns and disabled default tns specification in first element of the body (Ferry Kobus)

 * Use correct namespaces in sequences with imported elements. (Mik13)

 * only supply nonce when a password digest is used to avoid schema validation errors (lsalzman)

 * Updated 'extend' function. Refactored the function to copy properties from one object to another one and avoid properties overriding. This way we ensure the 'inheritance' of <xsd:extension base=...> usage. (dun4n)

 * Define $xml to pass xml object (Damien Picard)

 * Adding PUBLISHING.md (jsdevel)

 * Removes automatic port appending to "Host" header. (herom)

 * Avoid creating soap:Header container when there are no children This time including the matching fixture changes to remove <soap:Header></soap:Header> Added support for header and security fixtures in request/response tests, and added tests for header optionality (Shelby Sanders)

 * Updated CONTRIBUTING.md (herom)

 * Addresses #75 - Allowing a 'null' argument for WSDL methods that take no arguments (Chris Klosowski)

 * Fix for wrong initialization of xmlns array when handling rpc stype wsdl (ankush-garg)

 * Fixing fault handling (Diego Silveira)

 * Added checking if there is input and output for operations under bindings section (Krzysztof Gutkowski)

 * Fixing XSD conflict with same namespace (Diego Silveira)

 * Adding bearer security type Exporting security type for usage (Phil Hansen)

 * The qualified elementFormQualified must be respected only when the current element is not a global element. The namespace attribute is only needed if it's not included in the xmlnsInEnvelope collection. (frank)

 * updating History.md (jsdevel)

 * Add "defaults" parameter to BasicAuthSecurity's constructor (Luke Horvat)

 * added tests for HTTP Host header (John Sanderson)

 * don't append port 80 to Host if not needed (John Sanderson)

 * Add an .editorconfig file to improve the code formatting in contributors editor of choice. (herom)

 * Remove possible existing BOM characters from XML String before passing it to `WSDL#_fromXML()` and parsing it. (herom)

 * Added possibility to set a custom `valueKey` for the parsed values from XML SOAP Response as the current fixed "$value" key could collide with some policies (as it's the case when using MongoDB). (herom)

 * Handling nil attributes in response xml (Graham Hay)

 * Updating History (jsdevel)

 * Updated client.js; Created request-response-sample. (Lev Nazarenko)

 * Resolve namespaces correctly by ignoring "tns:", "targetNamespace", "typedNamespace:", ... prefixes in child elements by default. (herom)

 * adding default attributesKey to server and allowing the property to be configurable fixing issue #406 (Helder Rossa)

 * Remove extra characters before and after soap envelope (jkirkwood)

 * Fix: Allow operations to not have definitions (Chris Barton)

 * Update Readme.md (Tom Caflisch)

 * Ignore unknown elements (Graham Hay)

 * Keep ns from top-level (Graham Hay)

 * Check status code of invocation response (Graham Hay)

 * wsdl should handle more types (Dmytro Semenov)

 * Using jshint 2.3.0 for indentation. (jsdevel)

 * 0.4.7 release (jsdevel)

 * 0.4.6 release (jsdevel)

 * Added possiblity for request elements containing both content and attributes. (Jasper Woudenberg)

 * Fixup the `elementFormDefault` functionality. (Arthur Schreiber)

 * Fix determining the namespace for complex elements. (Arthur Schreiber)

 * Add support for the `elementFormDefault` schema attribute. (Arthur Schreiber)

 * Fixing duplicate code which had gotten introduced because of a merge. (ankush-garg)

 * Handle SOAP Response element value and attributes so that the attribu… …tes of an element don't get overwritten if also a value is given. (Heinz Romirer)

 * Allowing the property name "attributes" to be configurable. (Michael Hernandez)

 * Moving xsi type namespace processing to processAttributes method to handle xsiTypes for object of arrays. (ankush-garg)

 * Added the possibility to work with `wsdl` files which pull their `schema`s in through `import`s and declare their message `part` to have an `element` attribute instead of `type`. (herom)

 * Allowing response.xml to be optional in tests. (jsdevel)

 * Allowing request.xml and response.json to be optional for tests. (jsdevel)

 * Fix for adding an undefined XML namespace to the generated XML's child namespace (Abhijit Gaikwad)

 * Added some documentation on options object when calling createClient. (Golo Roden)

 * Patch for issue #150 (Ashvin)

 * Moving up guidelines for submitting Pull Requests. (Joseph Spencer)


2014-05-13, Version 0.4.5
=========================

 * 0.4.5 release (jsdevel)

 * Consolidate commit, intended to supersede #208 PR. (H. Arnold Jones)

 * An exception raised while parsing XML now hands off to callback of createConnection() instead of throwing it into the ether (+tests) (Christopher Hiller)

 * Fixed `AssertionError: Invalid child type` when WSDL contains imports, fix #322 (Joe Wong)

 * Fix for `TargetNamespace not loaded when import in schema #325` with Test-WSDL(Dummy.wsdl) and Test-Schemas(Common.xsd, Name.xsd) and writes message to the console when an `targetNamespace` already exists for an specific Schema and skips the extra Schema (phGitUser)

 * Update Readme.md (Joseph Spencer)


2014-04-16, Version 0.4.4
=========================

 * 0.4.4 release (jsdevel)

 * Updating security protocols, adding lodash. (jxspencer)

 * Fix and test for #257 (Peter Magnusson)

 * Fix to reset the generated namespace number. (ankush-garg)

 * Fixed issue when custom headers values are not sent correctly (Abhijit Gaikwad)


2014-04-07, Version 0.4.3
=========================

 * 0.4.3 release (jsdevel)

 * Refactored WS-security. small modifications to  pull #275 (Abhijit Gaikwad)

 * Updated readme to add documentation for passing options to a client request (Grant Shively)

 * Added null check for portType and methods[methodname].output (Abhijit Gaikwad)

 * Issue: Requests that included compex types led to invalid request XML. (Tomas Bartkus)

 * 1) Ability to add extra headers to the client request + two tests 2) Test to ensure that client has lastResponse and lastResponseHeaders after it returns (ankush-garg)

 * Support for attributes array elements and support for complex extensions with array elements. (ankush-garg)

 * Make sure callback is done asynchronously for a cached wsdl (Raymond Feng)

 * Fix for #133 - inheritance support. (ankush-garg)


2014-03-13, Version 0.4.2
=========================

 * 0.4.2 release (jxspencer)

 * Adding ability to inspect and clear soap headers. (ankush-garg)

 * Reducing test wsdl size (ankush-garg)

 * don't prefix default namespace elements with 'xmlns:' (Oran Dennison)


2014-03-04, Version 0.4.1
=========================

 * 0.4.1 release (jsdevel)

 * Add support for default namespace elements. Incorporated the changes from PR #173 and added a test WSDL. (Oran Dennison)

 * Attach root object to error on soap fault (ankush-garg)

 * Adding an npmignore on test/. (Joseph Spencer)

 * Update CONTRIBUTING.md (Joseph Spencer)

 * jshint is run on tests now, moved some tests over to mocha BDD format (Matt Broadstone)

 * Handle attributes in requests (ankush-garg)

 * add simple ssl-test.js, and example certs (Matt Broadstone)

 * move wsdl parsing tests to their own file (Matt Broadstone)

 * Fix for issue # 204. (ankush-garg)

 * makes node-soap ua matches package.json version (Nathan White)

 * Change OperationElement.prototype.describe to check for existence of input/output before adding them to the description. Unit test and sample WSDL file included. (Matt Broadstone)

 * Cleaning up vac and ip2tele directories under test/ (jsdevel)

 * minor grammar / markdown tweaks. (Joseph Spencer)

 * Moving attribute-parsing tests to request-response-samples and adding a README therein. (jsdevel)

 * Minor grammar fixes to CONTRIBUTING.md (Joseph Spencer)

 * Adding a CONTRIBUTING.md file (jsdevel)

 * travis project changed from milewise/node-soap to vpulim/node-soap (Vinay Pulim)


2014-02-15, Version 0.4.0
=========================

 * release 0.4.0 (Vinay Pulim)

 * 1) Added stripped down test NetSuite wsdl which was failing on describe 2) Updated test to describe Wsdls (ankush-garg)

 * Fix for "Uncaught TypeError: Cannot read property '0' of undefined". (ankush)

 * remove expat as a dependency and add sax (Christiaan Westerbeek)

 * Fixing undefined value for json in client response (jsdevel)

 * Add non xmlns attributes to elements during response parsing (jsdevel)

 * travis badge (Aaron Heckmann)

 * tests; fixed linux which passes ECONNREFUSED (Aaron Heckmann)

 * Start a new server instance for each test in server-test (Juho Vähä-Herttua)

 * Fix a potential crash in the client handler (Juho Vähä-Herttua)

 * Add a failing tests to reproduce an uncaught error (Juho Vähä-Herttua)

 * Fix requests if SOAP service is not on port 80 (Juho Vähä-Herttua)

 * removing execute permissions on .gitignore (jsdevel)

 * add-jshint for wsdl.js (jsdevel)

 * add-jshint for lib/soap.js (jsdevel)

 * add-jshint for lib/server.js (jsdevel)

 * add-jshint for lib/client.js (jsdevel)

 * add-jshint for lib/https.js (jsdevel)

 * Adding jshint for index.js (jsdevel)

 * add travis (Aaron Heckmann)

 * Remove execute privileges on files. (jsdevel)


2014-01-21, Version 0.3.2
=========================

 * First release!
