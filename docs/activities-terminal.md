PS C:\workplace_syeia\project_tickets\Sprint17> git log --oneline -5
fatal: not a git repository (or any of the parent directories): .git
PS C:\workplace_syeia\project_tickets\Sprint17> cd "C:\workplace_syeia\project_tickets\Sprint17\desnz-syeia-frontend-beta" ; git log --oneline -10
802c526 (HEAD -> feature/SYEIA-1768, origin/feature/SYEIA-1768) SYEIA-1768 dependecy update for package-lock.json
9419d7c SYEIA-1768 removing double router
27c1494 SYEIA-1768 changes for cookie policy
b037ff2 SYEIA-1768 add privacy policy
d21148a SYEIA-1768 cookie integration
c53228d SYEIA-1768 Cookie Banner Page
266d6ea (origin/release/sprint-16-uat, develop) SYEIA-1697 secure allowed host urls (#214)
b83c79e SYEIA-1573 [Content Update] Applicant Details - No Radio Option : SYEIA-1723 [Consultation Validation Bug]Other and LPA - 4000 character limit not respected (#212)
5e2b24d SYEIA-1741: [BUG] Validation Error causes Uploaded file to disappear (#208)
f0de9e0 SYEIA-1743: [BUG] - Provide public response - objection page error (#209)
PS C:\workplace_syeia\project_tickets\Sprint17\desnz-syeia-frontend-beta> git show --stat 802c526
commit 802c52652066d6139cd397dda86466b46a8647c0 (HEAD -> feature/SYEIA-1768, origin/feature/SYEIA-1768)
Author: Kumar <sagar.kumar@ics.gov.uk>
Date:   Sun May 10 13:08:21 2026 +0100

    SYEIA-1768 dependecy update for package-lock.json

 package-lock.json | 861 +++++++++++++++++++++++++++++++++++++++++-------------
 1 file changed, 651 insertions(+), 210 deletions(-)
PS C:\workplace_syeia\project_tickets\Sprint17\desnz-syeia-frontend-beta> git diff develop...HEAD --name-only
package-lock.json
package.json
src/App.tsx
src/constants/content.ts
src/constants/routes.ts
src/layouts/component/Footer.tsx
src/lib/analytics/events.ts
src/lib/analytics/strip-pii.ts
src/lib/analytics/track.ts
src/lib/analytics/usePageTracking.ts
src/main.tsx
src/modules/cookie-consent/CookieBanner.tsx
src/modules/cookie-consent/CookieConsentProvider.tsx
src/modules/cookie-consent/CookiesSettingsPage.tsx
src/modules/cookie-consent/consent-api.ts
src/modules/cookie-consent/cookie-utils.ts
src/modules/cookie-consent/index.ts
src/modules/cookie-consent/telemetry/ga4.ts
src/modules/cookie-consent/telemetry/index.ts
src/modules/cookie-consent/telemetry/rum.ts
src/modules/cookie-consent/types.ts
src/modules/privacy-policy/components/ContactInfo.tsx
src/modules/privacy-policy/components/PageFeedback.tsx
src/modules/privacy-policy/components/RelatedContent.tsx
src/modules/privacy-policy/components/index.ts
src/modules/privacy-policy/config/privacy.config.ts
src/modules/privacy-policy/index.ts
src/modules/privacy-policy/pages/AccessibilityStatementPage.tsx
src/modules/privacy-policy/pages/ContactPage.tsx
src/modules/privacy-policy/pages/HelpPage.tsx
src/modules/privacy-policy/pages/PrivacyNoticePage.tsx
src/modules/privacy-policy/pages/TermsAndConditionsPage.tsx
src/modules/privacy-policy/pages/index.ts
src/modules/privacy-policy/types.ts
src/modules/privacy-policy/utils/renderContent.tsx
PS C:\workplace_syeia\project_tickets\Sprint17\desnz-syeia-frontend-beta> git diff develop...HEAD -- package.json | head -50
head : The term 'head' is not recognized as the name of a cmdlet, 
function, script file, or operable program. Check the spelling of 
the name, or if a path was included, verify that the path is correct 
and try again.
At line:1 char:43
+ git diff develop...HEAD -- package.json | head -50
+                                           ~~~~
    + CategoryInfo          : ObjectNotFound: (head:String) [], Comm 
   andNotFoundException
    + FullyQualifiedErrorId : CommandNotFoundException
 
PS C:\workplace_syeia\project_tickets\Sprint17\desnz-syeia-frontend-beta> git diff develop...HEAD -- package.json
diff --git a/package.json b/package.json
index 7b13fba..03bba74 100644
--- a/package.json
+++ b/package.json
@@ -13,6 +13,7 @@
     "@govuk-react/icon-crown": "^0.1.0",
     "@types/leaflet": "^1.9.6",
     "@types/styled-components": "^5.1.34",
+    "aws-rum-web": "^1.19.0",
     "axios": "^1.8.4",
     "govuk-frontend": "^5.13.0",
     "govuk-react": "^0.10.7",
PS C:\workplace_syeia\project_tickets\Sprint17\desnz-syeia-frontend-beta> git status
On branch feature/SYEIA-1768
Your branch is up to date with 'origin/feature/SYEIA-1768'.

nothing to commit, working tree clean
PS C:\workplace_syeia\project_tickets\Sprint17\desnz-syeia-frontend-beta> ^C
PS C:\workplace_syeia\project_tickets\Sprint17\desnz-syeia-frontend-beta> git fetch origin
PS C:\workplace_syeia\project_tickets\Sprint17\desnz-syeia-frontend-beta> git fetch origin develop
From https://github.com/Integrated-Corporate-Services/desnz-syeia-frontend-beta
 * branch            develop    -> FETCH_HEAD
PS C:\workplace_syeia\project_tickets\Sprint17\desnz-syeia-frontend-beta> git log --oneline origin/develop..HEAD
802c526 (HEAD -> feature/SYEIA-1768, origin/feature/SYEIA-1768) SYEIA-1768 dependecy update for package-lock.json
9419d7c SYEIA-1768 removing double router
27c1494 SYEIA-1768 changes for cookie policy
b037ff2 SYEIA-1768 add privacy policy
d21148a SYEIA-1768 cookie integration
c53228d SYEIA-1768 Cookie Banner Page
PS C:\workplace_syeia\project_tickets\Sprint17\desnz-syeia-frontend-beta> git log --oneline HEAD..origin/develop
8dac108 (origin/develop, origin/HEAD) SYEIA-1828: [NWL-DEV] section 7 Additional Information implementation (#226)
c47d40a (origin/feature/SYEIA-1827-nwl-section-6-Negotiation-fix-updated) SYEIA-1827-nwl-section-6-Negotiation-fix (#227)
f306c22 SYEIA-1827: [NWL-DEV] section 6 Negotiations implementation (#225)
ae06a3a SYEIA-1809 NWL Land Details Sections (#223)
f113583 Feature/nwl application details (#224)
f36ee3f (origin/feature/SYEIA-1810-section-5-assests-implementation-updated) SYEIA:1810-updated the information about line pages (#222)
c8cab9c SYEIA-1809 NWL Objector Details Section (#220)
31486af NWL Applicant Details section changes (#221)
f335e09 Manage Consultation File Link Fix  , Save and Continue Functionality updates and File upload error messages issue fix (#219)
ecbe8be (origin/feature/SYEIA-1822-Unable-to-Submit-the-Withdrawal-request-frontend) SYEIA-1411: [S37] Displaying Previous Consultations (Closed & Withdrawn) (#218)
35db855 SYEIA-1411: [S37] Displaying Previous Consultations (Closed & Withdrawn) (#216)
6105e13 SYEIA-1671: [Common] Withdraw your application page (#205)
PS C:\workplace_syeia\project_tickets\Sprint17\desnz-syeia-frontend-beta> git rebase origin/develop
Auto-merging src/constants/routes.ts
CONFLICT (content): Merge conflict in src/constants/routes.ts
error: could not apply d21148a... SYEIA-1768 cookie integration
hint: Resolve all conflicts manually, mark them as resolved with
hint: "git add/rm <conflicted_files>", then run "git rebase --continue".
hint: You can instead skip this commit: run "git rebase --skip".
hint: To abort and get back to the state before "git rebase", run "git rebase --abort".
hint: Disable this message with "git config set advice.mergeConflict false"
Could not apply d21148a... # SYEIA-1768 cookie integration
PS C:\workplace_syeia\project_tickets\Sprint17\desnz-syeia-frontend-beta> git status
interactive rebase in progress; onto 8dac108
Last commands done (2 commands done):
   pick c53228d # SYEIA-1768 Cookie Banner Page
   pick d21148a # SYEIA-1768 cookie integration
Next commands to do (4 remaining commands):
   pick b037ff2 # SYEIA-1768 add privacy policy
   pick 27c1494 # SYEIA-1768 changes for cookie policy
  (use "git rebase --edit-todo" to view and edit)
You are currently rebasing branch 'feature/SYEIA-1768' on '8dac108'.
  (fix conflicts and then run "git rebase --continue")
  (use "git rebase --skip" to skip this patch)
  (use "git rebase --abort" to check out the original branch)

Changes to be committed:
  (use "git restore --staged <file>..." to unstage)
        modified:   package.json
        modified:   src/App.tsx
        deleted:    src/components/CookieBanner/CookieBanner.tsx
        deleted:    src/components/CookieBanner/CookieBannerAccepted.tsx
        deleted:    src/components/CookieBanner/CookieBannerMessage.tsx
        deleted:    src/components/CookieBanner/CookieBannerRejected.tsx
        deleted:    src/constants/cookieConstants.ts
        modified:   src/layouts/MainLayout.tsx
        new file:   src/lib/analytics/events.ts
        new file:   src/lib/analytics/strip-pii.ts
        new file:   src/lib/analytics/track.ts
        new file:   src/lib/analytics/usePageTracking.ts
        modified:   src/main.tsx
        new file:   src/modules/cookie-consent/CookieBanner.tsx
        new file:   src/modules/cookie-consent/CookieConsentProvider.tsx
        new file:   src/modules/cookie-consent/CookiesSettingsPage.tsx
        new file:   src/modules/cookie-consent/consent-api.ts
        new file:   src/modules/cookie-consent/cookie-utils.ts
        new file:   src/modules/cookie-consent/index.ts
        new file:   src/modules/cookie-consent/telemetry/ga4.ts
        new file:   src/modules/cookie-consent/telemetry/index.ts
        new file:   src/modules/cookie-consent/telemetry/rum.ts
        new file:   src/modules/cookie-consent/types.ts
        deleted:    src/pages/CookiesPage.tsx
        deleted:    src/store/useCookiePreferencesStore.ts
        deleted:    src/types/cookies.types.ts
        deleted:    src/utils/cookieUtils.ts

Unmerged paths:
  (use "git restore --staged <file>..." to unstage)
  (use "git add <file>..." to mark resolution)
        both modified:   src/constants/routes.ts

PS C:\workplace_syeia\project_tickets\Sprint17\desnz-syeia-frontend-beta> git add src/constants/routes.ts
PS C:\workplace_syeia\project_tickets\Sprint17\desnz-syeia-frontend-beta> git rebase --continue
[detached HEAD d59cdd0] SYEIA-1768 cookie integration
 Committer: Kumar <sagar.kumar@ics.gov.uk>
Your name and email address were configured automatically based
on your username and hostname. Please check that they are accurate.
You can suppress this message by setting them explicitly. Run the
following command and follow the instructions in your editor to edit
your configuration file:

    git config --global --edit

After doing this, you may fix the identity used for this commit with:

    git commit --amend --reset-author

 28 files changed, 875 insertions(+), 726 deletions(-)
 delete mode 100644 src/components/CookieBanner/CookieBanner.tsx
 delete mode 100644 src/components/CookieBanner/CookieBannerAccepted.tsx
 delete mode 100644 src/components/CookieBanner/CookieBannerMessage.tsx
 delete mode 100644 src/components/CookieBanner/CookieBannerRejected.tsx
 delete mode 100644 src/constants/cookieConstants.ts
 create mode 100644 src/lib/analytics/events.ts
 create mode 100644 src/lib/analytics/strip-pii.ts
 create mode 100644 src/lib/analytics/track.ts
 create mode 100644 src/lib/analytics/usePageTracking.ts
 create mode 100644 src/modules/cookie-consent/CookieBanner.tsx
 create mode 100644 src/modules/cookie-consent/CookieConsentProvider.tsx
 create mode 100644 src/modules/cookie-consent/CookiesSettingsPage.tsx
 create mode 100644 src/modules/cookie-consent/consent-api.ts
 create mode 100644 src/modules/cookie-consent/cookie-utils.ts
 create mode 100644 src/modules/cookie-consent/index.ts
 create mode 100644 src/modules/cookie-consent/telemetry/ga4.ts
 create mode 100644 src/modules/cookie-consent/telemetry/index.ts
 create mode 100644 src/modules/cookie-consent/telemetry/rum.ts
 create mode 100644 src/modules/cookie-consent/types.ts
 delete mode 100644 src/pages/CookiesPage.tsx
 delete mode 100644 src/store/useCookiePreferencesStore.ts
 delete mode 100644 src/types/cookies.types.ts
 delete mode 100644 src/utils/cookieUtils.ts
Successfully rebased and updated refs/heads/feature/SYEIA-1768.
PS C:\workplace_syeia\project_tickets\Sprint17\desnz-syeia-frontend-beta> git status
On branch feature/SYEIA-1768
Your branch and 'origin/feature/SYEIA-1768' have diverged,
and have 18 and 6 different commits each, respectively.
  (use "git pull" if you want to integrate the remote branch with yours)

nothing to commit, working tree clean
PS C:\workplace_syeia\project_tickets\Sprint17\desnz-syeia-frontend-beta> git log --oneline --graph -20
* e249745 (HEAD -> feature/SYEIA-1768) SYEIA-1768 dependecy update for package-lock.json
* dd3c34c SYEIA-1768 removing double router
* 5afe567 SYEIA-1768 changes for cookie policy
* 8d2ea56 SYEIA-1768 add privacy policy
* d59cdd0 SYEIA-1768 cookie integration
* 1dd4048 SYEIA-1768 Cookie Banner Page
* 8dac108 (origin/develop, origin/HEAD) SYEIA-1828: [NWL-DEV] section 7 Additional Information implementation (#226)
* c47d40a (origin/feature/SYEIA-1827-nwl-section-6-Negotiation-fix-updated) SYEIA-1827-nwl-section-6-Negotiation-fix (#227)
* f306c22 SYEIA-1827: [NWL-DEV] section 6 Negotiations implementation (#225)
* ae06a3a SYEIA-1809 NWL Land Details Sections (#223)
* f113583 Feature/nwl application details (#224)
* f36ee3f (origin/feature/SYEIA-1810-section-5-assests-implementation-updated) SYEIA:1810-updated the information about line pages (#222)
* c8cab9c SYEIA-1809 NWL Objector Details Section (#220)
* 31486af NWL Applicant Details section changes (#221)
* f335e09 Manage Consultation File Link Fix  , Save and Continue Functionality updates and File upload error messages issue fix (#219)
* ecbe8be (origin/feature/SYEIA-1822-Unable-to-Submit-the-Withdrawal-request-frontend) SYEIA-1411: [S37] Displaying Previous Consultations (Closed & Withdrawn) (#218)
* 35db855 SYEIA-1411: [S37] Displaying Previous Consultations (Closed & Withdrawn) (#216)
* 6105e13 SYEIA-1671: [Common] Withdraw your application page (#205)
* 266d6ea (origin/release/sprint-16-uat, develop) SYEIA-1697 secure allowed host urls (#214)
* b83c79e SYEIA-1573 [Content Update] Applicant Details - No Radio Option : SYEIA-1723 [Consultation Validation Bug]Other and LPA - 4000 character limit not respected (#212)
PS C:\workplace_syeia\project_tickets\Sprint17\desnz-syeia-frontend-beta> git status
On branch feature/SYEIA-1768
Your branch and 'origin/feature/SYEIA-1768' have diverged,
and have 18 and 6 different commits each, respectively.
  (use "git pull" if you want to integrate the remote branch with yours)

Untracked files:
  (use "git add <file>..." to include in what will be committed)
        docs/

nothing added to commit but untracked files present (use "git add" to track)
PS C:\workplace_syeia\project_tickets\Sprint17\desnz-syeia-frontend-beta> 
    node_modules\govuk-frontend\dist\govuk\core\_index.scss 2:9      @import
    node_modules\govuk-frontend\dist\govuk\index.scss 3:9            @import
    src\styles\govuk.scss 1:9                                        root stylesheet

Deprecation Warning [mixed-decls]: Sass's behavior for declarations that appear after nested
rules will be changing to match the behavior specified by CSS in an upcoming
version. To keep the existing behavior, move the declaration above the nested
rule. To opt into the new behavior, wrap the declaration in `& {}`.

More info: https://sass-lang.com/d/mixed-decls

   ┌──> node_modules\govuk-frontend\dist\govuk\helpers\_links.scss
31 │     text-decoration: underline;
   │     ^^^^^^^^^^^^^^^^^^^^^^^^^^ declaration
   ╵
   ┌──> node_modules\govuk-frontend\dist\govuk\helpers\_typography.scss
26 │ ┌   @media print {
27 │ │     font-family: $govuk-font-family-print;
28 │ │   }
   │ └─── nested rule
   ╵
    node_modules\govuk-frontend\dist\govuk\helpers\_links.scss 31:3  govuk-link-decoration()
    node_modules\govuk-frontend\dist\govuk\helpers\_links.scss 13:3  govuk-link-common()
    node_modules\govuk-frontend\dist\govuk\core\_links.scss 3:5      @content
    node_modules\govuk-frontend\dist\govuk\tools\_exports.scss 29:5  govuk-exports()
    node_modules\govuk-frontend\dist\govuk\core\_links.scss 1:1      @import
    node_modules\govuk-frontend\dist\govuk\core\_index.scss 2:9      @import
    node_modules\govuk-frontend\dist\govuk\index.scss 3:9            @import
    src\styles\govuk.scss 1:9                                        root stylesheet

Deprecation Warning [mixed-decls]: Sass's behavior for declarations that appear after nested
rules will be changing to match the behavior specified by CSS in an upcoming
version. To keep the existing behavior, move the declaration above the nested
rule. To opt into the new behavior, wrap the declaration in `& {}`.

More info: https://sass-lang.com/d/mixed-decls

   ┌──> node_modules\govuk-frontend\dist\govuk\helpers\_links.scss
34 │       text-decoration-thickness: $govuk-link-underline-thickness;
   │       ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^ declaration
   ╵
   ┌──> node_modules\govuk-frontend\dist\govuk\helpers\_font-faces.scss
18 │ ┌       @font-face {
19 │ │         font-family: "GDS Transport";
20 │ │         font-style: normal;
21 │ │         font-weight: normal;
22 │ │         src:
23 │ │           govuk-font-url("light-94a07e06a1-v2.woff2") format("woff2"),
24 │ │           govuk-font-url("light-f591b13f7d-v2.woff") format("woff");
25 │ │         font-display: fallback;
26 │ │       }
   │ └─── nested rule
   ╵
    node_modules\govuk-frontend\dist\govuk\helpers\_links.scss 34:5  govuk-link-decoration()
    node_modules\govuk-frontend\dist\govuk\helpers\_links.scss 13:3  govuk-link-common()
    node_modules\govuk-frontend\dist\govuk\core\_links.scss 3:5      @content
    node_modules\govuk-frontend\dist\govuk\tools\_exports.scss 29:5  govuk-exports()
    node_modules\govuk-frontend\dist\govuk\core\_links.scss 1:1      @import
    node_modules\govuk-frontend\dist\govuk\core\_index.scss 2:9      @import
    node_modules\govuk-frontend\dist\govuk\index.scss 3:9            @import
    src\styles\govuk.scss 1:9                                        root stylesheet

Deprecation Warning [mixed-decls]: Sass's behavior for declarations that appear after nested
rules will be changing to match the behavior specified by CSS in an upcoming
version. To keep the existing behavior, move the declaration above the nested
rule. To opt into the new behavior, wrap the declaration in `& {}`.

More info: https://sass-lang.com/d/mixed-decls

   ┌──> node_modules\govuk-frontend\dist\govuk\helpers\_links.scss
34 │       text-decoration-thickness: $govuk-link-underline-thickness;
   │       ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^ declaration
   ╵
   ┌──> node_modules\govuk-frontend\dist\govuk\helpers\_font-faces.scss
28 │ ┌       @font-face {
29 │ │         font-family: "GDS Transport";
30 │ │         font-style: normal;
31 │ │         font-weight: bold;
32 │ │         src:
33 │ │           govuk-font-url("bold-b542beb274-v2.woff2") format("woff2"),
34 │ │           govuk-font-url("bold-affa96571d-v2.woff") format("woff");
35 │ │         font-display: fallback;
36 │ │       }
   │ └─── nested rule
   ╵
    node_modules\govuk-frontend\dist\govuk\helpers\_links.scss 34:5  govuk-link-decoration()
    node_modules\govuk-frontend\dist\govuk\helpers\_links.scss 13:3  govuk-link-common()
    node_modules\govuk-frontend\dist\govuk\core\_links.scss 3:5      @content
    node_modules\govuk-frontend\dist\govuk\tools\_exports.scss 29:5  govuk-exports()
    node_modules\govuk-frontend\dist\govuk\core\_links.scss 1:1      @import
    node_modules\govuk-frontend\dist\govuk\core\_index.scss 2:9      @import
    node_modules\govuk-frontend\dist\govuk\index.scss 3:9            @import
    src\styles\govuk.scss 1:9                                        root stylesheet

Warning: 1486 repetitive deprecation warnings omitted.
Run in verbose mode to see all warnings.

12:50:46 [vite] (client) page reload src/main.tsx
12:50:52 [vite] (client) page reload src/main.tsx (x2)
PS C:\workplace_syeia\project_tickets\Sprint17\desnz-syeia-frontend-beta> git status
On branch feature/SYEIA-1768
Your branch is up to date with 'origin/feature/SYEIA-1768'.

Changes not staged for commit:
  (use "git add <file>..." to update what will be committed)
  (use "git restore <file>..." to discard changes in working directory)
        modified:   package-lock.json
        modified:   src/main.tsx

no changes added to commit (use "git add" and/or "git commit -a")
PS C:\workplace_syeia\project_tickets\Sprint17\desnz-syeia-frontend-beta> git add .\src\main.tsx
PS C:\workplace_syeia\project_tickets\Sprint17\desnz-syeia-frontend-beta> git status
On branch feature/SYEIA-1768
Your branch is up to date with 'origin/feature/SYEIA-1768'.

Changes to be committed:
  (use "git restore --staged <file>..." to unstage)
        modified:   src/main.tsx

Changes not staged for commit:
  (use "git add <file>..." to update what will be committed)
  (use "git restore <file>..." to discard changes in working directory)
        modified:   package-lock.json

PS C:\workplace_syeia\project_tickets\Sprint17\desnz-syeia-frontend-beta> git status            
On branch feature/SYEIA-1768
Your branch is up to date with 'origin/feature/SYEIA-1768'.

Changes to be committed:
  (use "git restore --staged <file>..." to unstage)
        modified:   src/main.tsx

Changes not staged for commit:
  (use "git add <file>..." to update what will be committed)
  (use "git restore <file>..." to discard changes in working directory)
        modified:   package-lock.json
        modified:   src/main.tsx

PS C:\workplace_syeia\project_tickets\Sprint17\desnz-syeia-frontend-beta> git add .\src\main.tsx
PS C:\workplace_syeia\project_tickets\Sprint17\desnz-syeia-frontend-beta> git status
On branch feature/SYEIA-1768
Your branch is up to date with 'origin/feature/SYEIA-1768'.

Changes to be committed:
  (use "git restore --staged <file>..." to unstage)
        modified:   src/main.tsx

Changes not staged for commit:
  (use "git add <file>..." to update what will be committed)
  (use "git restore <file>..." to discard changes in working directory)
        modified:   package-lock.json

PS C:\workplace_syeia\project_tickets\Sprint17\desnz-syeia-frontend-beta> git commit -m "SYEIA-1768 removing double router"   
[feature/SYEIA-1768 9419d7c] SYEIA-1768 removing double router
 Committer: Kumar <sagar.kumar@ics.gov.uk>
Your name and email address were configured automatically based
on your username and hostname. Please check that they are accurate.
You can suppress this message by setting them explicitly. Run the
following command and follow the instructions in your editor to edit
your configuration file:

    git config --global --edit

After doing this, you may fix the identity used for this commit with:

    git commit --amend --reset-author

 1 file changed, 3 insertions(+), 12 deletions(-)
PS C:\workplace_syeia\project_tickets\Sprint17\desnz-syeia-frontend-beta> git push
Enumerating objects: 7, done.
Counting objects: 100% (7/7), done.
Delta compression using up to 4 threads
Compressing objects: 100% (4/4), done.
Writing objects: 100% (4/4), 408 bytes | 408.00 KiB/s, done.
Total 4 (delta 3), reused 0 (delta 0), pack-reused 0 (from 0)
remote: Resolving deltas: 100% (3/3), completed with 3 local objects.
remote: 
remote: GitHub found 29 vulnerabilities on Integrated-Corporate-Services/desnz-syeia-frontend-beta's default branch (15 high, 13 moderate, 1 low). To find out more, visit:
remote:      https://github.com/Integrated-Corporate-Services/desnz-syeia-frontend-beta/security/dependabot
remote: 
To https://github.com/Integrated-Corporate-Services/desnz-syeia-frontend-beta.git
   27c1494..9419d7c  feature/SYEIA-1768 -> feature/SYEIA-1768
PS C:\workplace_syeia\project_tickets\Sprint17\desnz-syeia-frontend-beta> git status
On branch feature/SYEIA-1768
Your branch is up to date with 'origin/feature/SYEIA-1768'.

Changes not staged for commit:
  (use "git add <file>..." to update what will be committed)
  (use "git restore <file>..." to discard changes in working directory)
        modified:   package-lock.json

no changes added to commit (use "git add" and/or "git commit -a")
PS C:\workplace_syeia\project_tickets\Sprint17\desnz-syeia-frontend-beta> npm install

up to date, audited 389 packages in 6s

94 packages are looking for funding
  run `npm fund` for details

12 vulnerabilities (5 moderate, 7 high)

To address all issues, run:
  npm audit fix

Run `npm audit` for details.
PS C:\workplace_syeia\project_tickets\Sprint17\desnz-syeia-frontend-beta> npm audit fix

added 1 package, removed 4 packages, changed 23 packages, and audited 386 packages in 12s

93 packages are looking for funding
  run `npm fund` for details

found 0 vulnerabilities
PS C:\workplace_syeia\project_tickets\Sprint17\desnz-syeia-frontend-beta> npm run build

> desnz-syeia-frontend@0.0.0 build
> tsc -b && vite build

vite v6.4.2 building for production...
transforming (1) src\main.tsxDeprecation Warning [import]: Sass @import rules are deprecated and will be removed in Dart Sass 3.0.0.

More info and automated migrator: https://sass-lang.com/d/import

  ╷
1 │ @import "../../node_modules/govuk-frontend/dist/govuk/index";
  │         ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  ╵
    src\styles\govuk.scss 1:9  root stylesheet

Deprecation Warning [import]: Sass @import rules are deprecated and will be removed in Dart Sass 3.0.0.

More info and automated migrator: https://sass-lang.com/d/import

  ╷
1 │ @import "base";
  │         ^^^^^^
  ╵
    node_modules\govuk-frontend\dist\govuk\index.scss 1:9  @import
    src\styles\govuk.scss 1:9                              root stylesheet

Deprecation Warning [import]: Sass @import rules are deprecated and will be removed in Dart Sass 3.0.0.

More info and automated migrator: https://sass-lang.com/d/import

  ╷
3 │ @import "core/index";
  │         ^^^^^^^^^^^^
  ╵
    node_modules\govuk-frontend\dist\govuk\index.scss 3:9  @import
    src\styles\govuk.scss 1:9                              root stylesheet

Deprecation Warning [import]: Sass @import rules are deprecated and will be removed in Dart Sass 3.0.0.

More info and automated migrator: https://sass-lang.com/d/import

  ╷
4 │ @import "objects/index";
  │         ^^^^^^^^^^^^^^^
  ╵
    node_modules\govuk-frontend\dist\govuk\index.scss 4:9  @import
    src\styles\govuk.scss 1:9                              root stylesheet

Deprecation Warning [import]: Sass @import rules are deprecated and will be removed in Dart Sass 3.0.0.

More info and automated migrator: https://sass-lang.com/d/import

  ╷
6 │ @import "components/index";
  │         ^^^^^^^^^^^^^^^^^^
  ╵
    node_modules\govuk-frontend\dist\govuk\index.scss 6:9  @import
    src\styles\govuk.scss 1:9                              root stylesheet

Deprecation Warning [global-builtin]: Global built-in functions are deprecated and will be removed in Dart Sass 3.0.0.
Use meta.type-of instead.

More info and automated migrator: https://sass-lang.com/d/import

   ╷
30 │   @if type-of($colour) == "color" {
   │       ^^^^^^^^^^^^^^^^
   ╵
    node_modules\govuk-frontend\dist\govuk\helpers\_colour.scss 30:7             govuk-colour()
    node_modules\govuk-frontend\dist\govuk\settings\_colours-applied.scss 16:22  @import
    node_modules\govuk-frontend\dist\govuk\settings\_index.scss 13:9             @import
    node_modules\govuk-frontend\dist\govuk\_base.scss 1:9                        @import
    node_modules\govuk-frontend\dist\govuk\index.scss 1:9                        @import
    src\styles\govuk.scss 1:9                                                    root stylesheet

Deprecation Warning [global-builtin]: Global built-in functions are deprecated and will be removed in Dart Sass 3.0.0.
Use map.has-key instead.

More info and automated migrator: https://sass-lang.com/d/import

   ╷
35 │   @if not map-has-key($govuk-colours, $colour) {
   │           ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
   ╵
    node_modules\govuk-frontend\dist\govuk\helpers\_colour.scss 35:11            govuk-colour()
    node_modules\govuk-frontend\dist\govuk\settings\_colours-applied.scss 16:22  @import
    node_modules\govuk-frontend\dist\govuk\settings\_index.scss 13:9             @import
    node_modules\govuk-frontend\dist\govuk\_base.scss 1:9                        @import
    node_modules\govuk-frontend\dist\govuk\index.scss 1:9                        @import
    src\styles\govuk.scss 1:9                                                    root stylesheet

Deprecation Warning [global-builtin]: Global built-in functions are deprecated and will be removed in Dart Sass 3.0.0.
Use map.get instead.

More info and automated migrator: https://sass-lang.com/d/import

   ╷
39 │   @return map-get($govuk-colours, $colour);
   │           ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
   ╵
    node_modules\govuk-frontend\dist\govuk\helpers\_colour.scss 39:11            govuk-colour()
    node_modules\govuk-frontend\dist\govuk\settings\_colours-applied.scss 16:22  @import
    node_modules\govuk-frontend\dist\govuk\settings\_index.scss 13:9             @import
    node_modules\govuk-frontend\dist\govuk\_base.scss 1:9                        @import
    node_modules\govuk-frontend\dist\govuk\index.scss 1:9                        @import
    src\styles\govuk.scss 1:9                                                    root stylesheet

Deprecation Warning [global-builtin]: Global built-in functions are deprecated and will be removed in Dart Sass 3.0.0.
Use color.mix instead.

More info and automated migrator: https://sass-lang.com/d/import

    ╷
139 │   @return _as-hexadecimal(mix(govuk-colour("white"), $colour, $percentage));
    │                           ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
    ╵
    node_modules\govuk-frontend\dist\govuk\helpers\_colour.scss 139:27            govuk-tint()
    node_modules\govuk-frontend\dist\govuk\settings\_colours-applied.scss 187:45  @import
    node_modules\govuk-frontend\dist\govuk\settings\_index.scss 13:9              @import
    node_modules\govuk-frontend\dist\govuk\_base.scss 1:9                         @import
    node_modules\govuk-frontend\dist\govuk\index.scss 1:9                         @import
    src\styles\govuk.scss 1:9                                                     root stylesheet

Deprecation Warning [global-builtin]: Global built-in functions are deprecated and will be removed in Dart Sass 3.0.0.
Use meta.function-exists instead.

More info and automated migrator: https://sass-lang.com/d/import

    ╷
151 │   @if not function-exists(change-color) {
    │           ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
    ╵
    node_modules\govuk-frontend\dist\govuk\helpers\_colour.scss 151:11            -as-hexadecimal()
    node_modules\govuk-frontend\dist\govuk\helpers\_colour.scss 139:11            govuk-tint()
    node_modules\govuk-frontend\dist\govuk\settings\_colours-applied.scss 187:45  @import
    node_modules\govuk-frontend\dist\govuk\settings\_index.scss 13:9              @import
    node_modules\govuk-frontend\dist\govuk\_base.scss 1:9                         @import
    node_modules\govuk-frontend\dist\govuk\index.scss 1:9                         @import
    src\styles\govuk.scss 1:9                                                     root stylesheet

Deprecation Warning [color-functions]: red() is deprecated. Suggestion:

color.channel($color, "red", $space: rgb)

More info: https://sass-lang.com/d/color-functions

    ╷
158 │     "red": red($colour),
    │            ^^^^^^^^^^^^
    ╵
    node_modules\govuk-frontend\dist\govuk\helpers\_colour.scss 158:12            -as-hexadecimal()
    node_modules\govuk-frontend\dist\govuk\helpers\_colour.scss 139:11            govuk-tint()
    node_modules\govuk-frontend\dist\govuk\settings\_colours-applied.scss 187:45  @import
    node_modules\govuk-frontend\dist\govuk\settings\_index.scss 13:9              @import
    node_modules\govuk-frontend\dist\govuk\_base.scss 1:9                         @import
    node_modules\govuk-frontend\dist\govuk\index.scss 1:9                         @import
    src\styles\govuk.scss 1:9                                                     root stylesheet

Deprecation Warning [color-functions]: green() is deprecated. Suggestion:

color.channel($color, "green", $space: rgb)

More info: https://sass-lang.com/d/color-functions

    ╷
159 │     "green": green($colour),
    │              ^^^^^^^^^^^^^^
    ╵
    node_modules\govuk-frontend\dist\govuk\helpers\_colour.scss 159:14            -as-hexadecimal()
    node_modules\govuk-frontend\dist\govuk\helpers\_colour.scss 139:11            govuk-tint()
    node_modules\govuk-frontend\dist\govuk\settings\_colours-applied.scss 187:45  @import
    node_modules\govuk-frontend\dist\govuk\settings\_index.scss 13:9              @import
    node_modules\govuk-frontend\dist\govuk\_base.scss 1:9                         @import
    node_modules\govuk-frontend\dist\govuk\index.scss 1:9                         @import
    src\styles\govuk.scss 1:9                                                     root stylesheet

Deprecation Warning [color-functions]: blue() is deprecated. Suggestion:

color.channel($color, "blue", $space: rgb)

More info: https://sass-lang.com/d/color-functions

    ╷
160 │     "blue": blue($colour),
    │             ^^^^^^^^^^^^^
    ╵
    node_modules\govuk-frontend\dist\govuk\helpers\_colour.scss 160:13            -as-hexadecimal()
    node_modules\govuk-frontend\dist\govuk\helpers\_colour.scss 139:11            govuk-tint()
    node_modules\govuk-frontend\dist\govuk\settings\_colours-applied.scss 187:45  @import
    node_modules\govuk-frontend\dist\govuk\settings\_index.scss 13:9              @import
    node_modules\govuk-frontend\dist\govuk\_base.scss 1:9                         @import
    node_modules\govuk-frontend\dist\govuk\index.scss 1:9                         @import
    src\styles\govuk.scss 1:9                                                     root stylesheet

Deprecation Warning [slash-div]: Using / for division outside of calc() is deprecated and will be removed in Dart Sass 2.0.0.

Recommendation: math.div(100%, 4) or calc(100% / 4)

More info and automated migrator: https://sass-lang.com/d/slash-div

   ╷
23 │     100% / 4
   │     ^^^^^^^^
   ╵
    node_modules\govuk-frontend\dist\govuk\settings\_measurements.scss 23:5  @import
    node_modules\govuk-frontend\dist\govuk\settings\_index.scss 16:9         @import
    node_modules\govuk-frontend\dist\govuk\_base.scss 1:9                    @import
    node_modules\govuk-frontend\dist\govuk\index.scss 1:9                    @import
    src\styles\govuk.scss 1:9                                                root stylesheet

Deprecation Warning [slash-div]: Using / for division outside of calc() is deprecated and will be removed in Dart Sass 2.0.0.

Recommendation: math.div(100%, 3) or calc(100% / 3)

More info and automated migrator: https://sass-lang.com/d/slash-div

   ╷
26 │     100% / 3
   │     ^^^^^^^^
   ╵
    node_modules\govuk-frontend\dist\govuk\settings\_measurements.scss 26:5  @import
    node_modules\govuk-frontend\dist\govuk\settings\_index.scss 16:9         @import
    node_modules\govuk-frontend\dist\govuk\_base.scss 1:9                    @import
    node_modules\govuk-frontend\dist\govuk\index.scss 1:9                    @import
    src\styles\govuk.scss 1:9                                                root stylesheet

Deprecation Warning [slash-div]: Using / for division outside of calc() is deprecated and will be removed in Dart Sass 2.0.0.

Recommendation: math.div(100%, 2) or calc(100% / 2)

More info and automated migrator: https://sass-lang.com/d/slash-div

   ╷
29 │     100% / 2
   │     ^^^^^^^^
   ╵
    node_modules\govuk-frontend\dist\govuk\settings\_measurements.scss 29:5  @import
    node_modules\govuk-frontend\dist\govuk\settings\_index.scss 16:9         @import
    node_modules\govuk-frontend\dist\govuk\_base.scss 1:9                    @import
    node_modules\govuk-frontend\dist\govuk\index.scss 1:9                    @import
    src\styles\govuk.scss 1:9                                                root stylesheet

Deprecation Warning [slash-div]: Using / for division outside of calc() is deprecated and will be removed in Dart Sass 2.0.0.

Recommendation: math.div(200%, 3) or calc(200% / 3)

More info and automated migrator: https://sass-lang.com/d/slash-div

   ╷
32 │     200% / 3
   │     ^^^^^^^^
   ╵
    node_modules\govuk-frontend\dist\govuk\settings\_measurements.scss 32:5  @import
    node_modules\govuk-frontend\dist\govuk\settings\_index.scss 16:9         @import
    node_modules\govuk-frontend\dist\govuk\_base.scss 1:9                    @import
    node_modules\govuk-frontend\dist\govuk\index.scss 1:9                    @import
    src\styles\govuk.scss 1:9                                                root stylesheet

Deprecation Warning [slash-div]: Using / for division outside of calc() is deprecated and will be removed in Dart Sass 2.0.0.

Recommendation: math.div(300%, 4) or calc(300% / 4)

More info and automated migrator: https://sass-lang.com/d/slash-div

   ╷
35 │     300% / 4
   │     ^^^^^^^^
   ╵
    node_modules\govuk-frontend\dist\govuk\settings\_measurements.scss 35:5  @import
    node_modules\govuk-frontend\dist\govuk\settings\_index.scss 16:9         @import
    node_modules\govuk-frontend\dist\govuk\_base.scss 1:9                    @import
    node_modules\govuk-frontend\dist\govuk\index.scss 1:9                    @import
    src\styles\govuk.scss 1:9                                                root stylesheet

Deprecation Warning [mixed-decls]: Sass's behavior for declarations that appear after nested
rules will be changing to match the behavior specified by CSS in an upcoming
version. To keep the existing behavior, move the declaration above the nested
rule. To opt into the new behavior, wrap the declaration in `& {}`.

More info: https://sass-lang.com/d/mixed-decls

   ┌──> node_modules\govuk-frontend\dist\govuk\helpers\_links.scss
31 │     text-decoration: underline;
   │     ^^^^^^^^^^^^^^^^^^^^^^^^^^ declaration
   ╵
   ┌──> node_modules\govuk-frontend\dist\govuk\helpers\_font-faces.scss
18 │ ┌       @font-face {
19 │ │         font-family: "GDS Transport";
20 │ │         font-style: normal;
21 │ │         font-weight: normal;
22 │ │         src:
23 │ │           govuk-font-url("light-94a07e06a1-v2.woff2") format("woff2"),
24 │ │           govuk-font-url("light-f591b13f7d-v2.woff") format("woff");
25 │ │         font-display: fallback;
26 │ │       }
   │ └─── nested rule
   ╵
    node_modules\govuk-frontend\dist\govuk\helpers\_links.scss 31:3  govuk-link-decoration()
    node_modules\govuk-frontend\dist\govuk\helpers\_links.scss 13:3  govuk-link-common()
    node_modules\govuk-frontend\dist\govuk\core\_links.scss 3:5      @content
    node_modules\govuk-frontend\dist\govuk\tools\_exports.scss 29:5  govuk-exports()
    node_modules\govuk-frontend\dist\govuk\core\_links.scss 1:1      @import
    node_modules\govuk-frontend\dist\govuk\core\_index.scss 2:9      @import
    node_modules\govuk-frontend\dist\govuk\index.scss 3:9            @import
    src\styles\govuk.scss 1:9                                        root stylesheet

Deprecation Warning [mixed-decls]: Sass's behavior for declarations that appear after nested
rules will be changing to match the behavior specified by CSS in an upcoming
version. To keep the existing behavior, move the declaration above the nested
rule. To opt into the new behavior, wrap the declaration in `& {}`.

More info: https://sass-lang.com/d/mixed-decls

   ┌──> node_modules\govuk-frontend\dist\govuk\helpers\_links.scss
31 │     text-decoration: underline;
   │     ^^^^^^^^^^^^^^^^^^^^^^^^^^ declaration
   ╵
   ┌──> node_modules\govuk-frontend\dist\govuk\helpers\_font-faces.scss
28 │ ┌       @font-face {
29 │ │         font-family: "GDS Transport";
30 │ │         font-style: normal;
31 │ │         font-weight: bold;
32 │ │         src:
33 │ │           govuk-font-url("bold-b542beb274-v2.woff2") format("woff2"),
34 │ │           govuk-font-url("bold-affa96571d-v2.woff") format("woff");
35 │ │         font-display: fallback;
36 │ │       }
   │ └─── nested rule
   ╵
    node_modules\govuk-frontend\dist\govuk\helpers\_links.scss 31:3  govuk-link-decoration()
    node_modules\govuk-frontend\dist\govuk\helpers\_links.scss 13:3  govuk-link-common()
    node_modules\govuk-frontend\dist\govuk\core\_links.scss 3:5      @content
    node_modules\govuk-frontend\dist\govuk\tools\_exports.scss 29:5  govuk-exports()
    node_modules\govuk-frontend\dist\govuk\core\_links.scss 1:1      @import
    node_modules\govuk-frontend\dist\govuk\core\_index.scss 2:9      @import
    node_modules\govuk-frontend\dist\govuk\index.scss 3:9            @import
    src\styles\govuk.scss 1:9                                        root stylesheet

Deprecation Warning [mixed-decls]: Sass's behavior for declarations that appear after nested
rules will be changing to match the behavior specified by CSS in an upcoming
version. To keep the existing behavior, move the declaration above the nested
rule. To opt into the new behavior, wrap the declaration in `& {}`.

More info: https://sass-lang.com/d/mixed-decls

   ┌──> node_modules\govuk-frontend\dist\govuk\helpers\_links.scss
31 │     text-decoration: underline;
   │     ^^^^^^^^^^^^^^^^^^^^^^^^^^ declaration
   ╵
   ┌──> node_modules\govuk-frontend\dist\govuk\helpers\_typography.scss
26 │ ┌   @media print {
27 │ │     font-family: $govuk-font-family-print;
28 │ │   }
   │ └─── nested rule
   ╵
    node_modules\govuk-frontend\dist\govuk\helpers\_links.scss 31:3  govuk-link-decoration()
    node_modules\govuk-frontend\dist\govuk\helpers\_links.scss 13:3  govuk-link-common()
    node_modules\govuk-frontend\dist\govuk\core\_links.scss 3:5      @content
    node_modules\govuk-frontend\dist\govuk\tools\_exports.scss 29:5  govuk-exports()
    node_modules\govuk-frontend\dist\govuk\core\_links.scss 1:1      @import
    node_modules\govuk-frontend\dist\govuk\core\_index.scss 2:9      @import
    node_modules\govuk-frontend\dist\govuk\index.scss 3:9            @import
    src\styles\govuk.scss 1:9                                        root stylesheet

Deprecation Warning [mixed-decls]: Sass's behavior for declarations that appear after nested
rules will be changing to match the behavior specified by CSS in an upcoming
version. To keep the existing behavior, move the declaration above the nested
rule. To opt into the new behavior, wrap the declaration in `& {}`.

More info: https://sass-lang.com/d/mixed-decls

   ┌──> node_modules\govuk-frontend\dist\govuk\helpers\_links.scss
34 │       text-decoration-thickness: $govuk-link-underline-thickness;
   │       ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^ declaration
   ╵
   ┌──> node_modules\govuk-frontend\dist\govuk\helpers\_font-faces.scss
18 │ ┌       @font-face {
19 │ │         font-family: "GDS Transport";
20 │ │         font-style: normal;
21 │ │         font-weight: normal;
22 │ │         src:
23 │ │           govuk-font-url("light-94a07e06a1-v2.woff2") format("woff2"),
24 │ │           govuk-font-url("light-f591b13f7d-v2.woff") format("woff");
25 │ │         font-display: fallback;
26 │ │       }
   │ └─── nested rule
   ╵
    node_modules\govuk-frontend\dist\govuk\helpers\_links.scss 34:5  govuk-link-decoration()
    node_modules\govuk-frontend\dist\govuk\helpers\_links.scss 13:3  govuk-link-common()
    node_modules\govuk-frontend\dist\govuk\core\_links.scss 3:5      @content
    node_modules\govuk-frontend\dist\govuk\tools\_exports.scss 29:5  govuk-exports()
    node_modules\govuk-frontend\dist\govuk\core\_links.scss 1:1      @import
    node_modules\govuk-frontend\dist\govuk\core\_index.scss 2:9      @import
    node_modules\govuk-frontend\dist\govuk\index.scss 3:9            @import
    src\styles\govuk.scss 1:9                                        root stylesheet

Deprecation Warning [mixed-decls]: Sass's behavior for declarations that appear after nested
rules will be changing to match the behavior specified by CSS in an upcoming
version. To keep the existing behavior, move the declaration above the nested
rule. To opt into the new behavior, wrap the declaration in `& {}`.

More info: https://sass-lang.com/d/mixed-decls

   ┌──> node_modules\govuk-frontend\dist\govuk\helpers\_links.scss
34 │       text-decoration-thickness: $govuk-link-underline-thickness;
   │       ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^ declaration
   ╵
   ┌──> node_modules\govuk-frontend\dist\govuk\helpers\_font-faces.scss
28 │ ┌       @font-face {
29 │ │         font-family: "GDS Transport";
30 │ │         font-style: normal;
31 │ │         font-weight: bold;
32 │ │         src:
33 │ │           govuk-font-url("bold-b542beb274-v2.woff2") format("woff2"),
34 │ │           govuk-font-url("bold-affa96571d-v2.woff") format("woff");
35 │ │         font-display: fallback;
36 │ │       }
   │ └─── nested rule
   ╵
    node_modules\govuk-frontend\dist\govuk\helpers\_links.scss 34:5  govuk-link-decoration()
    node_modules\govuk-frontend\dist\govuk\helpers\_links.scss 13:3  govuk-link-common()
    node_modules\govuk-frontend\dist\govuk\core\_links.scss 3:5      @content
    node_modules\govuk-frontend\dist\govuk\tools\_exports.scss 29:5  govuk-exports()
    node_modules\govuk-frontend\dist\govuk\core\_links.scss 1:1      @import
    node_modules\govuk-frontend\dist\govuk\core\_index.scss 2:9      @import
    node_modules\govuk-frontend\dist\govuk\index.scss 3:9            @import
    src\styles\govuk.scss 1:9                                        root stylesheet

Warning: 1486 repetitive deprecation warnings omitted.
Run in verbose mode to see all warnings.

node_modules/react-router/dist/development/index.mjs (11:0): Module level directives cause errors when bundled, "use client" in "node_modules/react-router/dist/development/index.mjs" was ignored.

/assets/fonts/light-94a07e06a1-v2.woff2 referenced in /assets/fonts/light-94a07e06a1-v2.woff2 didn't resolve at build time, it will remain unchanged to be resolved at runtime

/assets/fonts/bold-b542beb274-v2.woff2 referenced in /assets/fonts/bold-b542beb274-v2.woff2 didn't resolve at build time, it will remain unchanged to be resolved at runtime

/assets/images/govuk-crest.svg referenced in /assets/images/govuk-crest.svg didn't resolve at build time, it will remain unchanged to be resolved at runtime

/assets/fonts/light-f591b13f7d-v2.woff referenced in /assets/fonts/light-f591b13f7d-v2.woff didn't resolve at build time, it will remain unchanged to be resolved at runtime

/assets/fonts/bold-affa96571d-v2.woff referenced in /assets/fonts/bold-affa96571d-v2.woff didn't resolve at build time, it will remain unchanged to be resolved at runtime
node_modules/react-router/dist/development/dom-export.mjs (1:0): Module level directives cause errors when bundled, "use client" in "node_modules/react-router/dist/development/dom-export.mjs" was ignored.
✓ 1089 modules transformed.
[plugin vite:reporter] 
(!) C:/workplace_syeia/project_tickets/Sprint17/desnz-syeia-frontend-beta/src/services/s3ApiService.ts is dynamically imported by C:/workplace_syeia/project_tickets/Sprint17/desnz-syeia-frontend-beta/src/utils/s3DownloadUtil.ts, C:/workplace_syeia/project_tickets/Sprint17/desnz-syeia-frontend-beta/src/utils/s3DownloadUtil.ts but also statically imported by C:/workplace_syeia/project_tickets/Sprint17/desnz-syeia-frontend-beta/src/components/FileUpload.tsx, dynamic import will not move module into another chunk.

[plugin vite:reporter] 
(!) C:/workplace_syeia/project_tickets/Sprint17/desnz-syeia-frontend-beta/src/services/asset-service.ts is dynamically imported by C:/workplace_syeia/project_tickets/Sprint17/desnz-syeia-frontend-beta/src/features/NWL/Assets/pages/Assets.tsx, C:/workplace_syeia/project_tickets/Sprint17/desnz-syeia-frontend-beta/src/features/TLP/Assets/pages/Assets.tsx but also statically imported by C:/workplace_syeia/project_tickets/Sprint17/desnz-syeia-frontend-beta/src/features/AssetInfo/pages/AssetInformationForm.tsx, C:/workplace_syeia/project_tickets/Sprint17/desnz-syeia-frontend-beta/src/features/NWL/Assets/pages/Assets.tsx, C:/workplace_syeia/project_tickets/Sprint17/desnz-syeia-frontend-beta/src/features/TLP/Assets/pages/Assets.tsx, C:/workplace_syeia/project_tickets/Sprint17/desnz-syeia-frontend-beta/src/store/useAssetStore.ts, dynamic import will not move module into another chunk.

dist/index.html                                     0.45 kB │ gzip:   0.30 kB
dist/assets/eip_multiple_routes-2-CaGtl001.png    114.79 kB
dist/assets/eip_route_overview-3-Bm7JGj07.png     119.45 kB
dist/assets/eip_simple_route-1-BGsGvGCn.png       149.81 kB
dist/assets/index-DsufKx8D.css                    237.48 kB │ gzip:  33.27 kB
dist/assets/index-Bep23gbZ.js                   1,811.50 kB │ gzip: 456.75 kB

(!) Some chunks are larger than 500 kB after minification. Consider:
- Using dynamic import() to code-split the application
- Use build.rollupOptions.output.manualChunks to improve chunking: https://rollupjs.org/configuration-options/#output-manualchunks
- Adjust chunk size limit for this warning via build.chunkSizeWarningLimit.
✓ built in 15.61s
PS C:\workplace_syeia\project_tickets\Sprint17\desnz-syeia-frontend-beta> git status
On branch feature/SYEIA-1768
Your branch is up to date with 'origin/feature/SYEIA-1768'.

Changes not staged for commit:
  (use "git add <file>..." to update what will be committed)
  (use "git restore <file>..." to discard changes in working directory)
        modified:   package-lock.json

no changes added to commit (use "git add" and/or "git commit -a")
PS C:\workplace_syeia\project_tickets\Sprint17\desnz-syeia-frontend-beta> git add .\package-lock.json
PS C:\workplace_syeia\project_tickets\Sprint17\desnz-syeia-frontend-beta> git status
On branch feature/SYEIA-1768
Your branch is up to date with 'origin/feature/SYEIA-1768'.

Changes to be committed:
  (use "git restore --staged <file>..." to unstage)
        modified:   package-lock.json

PS C:\workplace_syeia\project_tickets\Sprint17\desnz-syeia-frontend-beta> git commit -m "SYEIA-1768 dependecy update for package-lock.json"
[feature/SYEIA-1768 802c526] SYEIA-1768 dependecy update for package-lock.json
 Committer: Kumar <sagar.kumar@ics.gov.uk>
Your name and email address were configured automatically based
on your username and hostname. Please check that they are accurate.
You can suppress this message by setting them explicitly. Run the
following command and follow the instructions in your editor to edit
your configuration file:

    git config --global --edit

After doing this, you may fix the identity used for this commit with:

    git commit --amend --reset-author

 1 file changed, 651 insertions(+), 210 deletions(-)
PS C:\workplace_syeia\project_tickets\Sprint17\desnz-syeia-frontend-beta> git push
Enumerating objects: 5, done.
Counting objects: 100% (5/5), done.
Delta compression using up to 4 threads
Compressing objects: 100% (3/3), done.
Writing objects: 100% (3/3), 8.78 KiB | 1.46 MiB/s, done.
Total 3 (delta 2), reused 0 (delta 0), pack-reused 0 (from 0)
remote: Resolving deltas: 100% (2/2), completed with 2 local objects.
remote: 
remote: GitHub found 29 vulnerabilities on Integrated-Corporate-Services/desnz-syeia-frontend-beta's default branch (15 high, 13 moderate, 1 low). To find out more, visit:
remote:      https://github.com/Integrated-Corporate-Services/desnz-syeia-frontend-beta/security/dependabot
remote: 
To https://github.com/Integrated-Corporate-Services/desnz-syeia-frontend-beta.git
   9419d7c..802c526  feature/SYEIA-1768 -> feature/SYEIA-1768
PS C:\workplace_syeia\project_tickets\Sprint17\desnz-syeia-frontend-beta> 