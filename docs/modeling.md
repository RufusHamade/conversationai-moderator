# Modeling

## User
- id (int) (required)
- group (enum: general, admin, service) (required)
- email (string) (required for all but users in the "service" group)
- name (string) (required)
- endpoint (string) (required for "service" users)
- isActive (tinyint) (required)
- avatarURL (string)
- extra (json)

### Indexes
- group
- isActive
- email (unique)

## UserSocialAuth
- id (int) (required)
- userId (foreign key: User) (required)
- socialId (string) (required) (provider user id)
- provider (string) (required) (name of auth provider, e.g. "google")
- extra (json)

### Indexes
- userId + provider (unique) (don't let the same user use the same provider multiple times)
- socialId + provider (unique) (don't allow the same provider user to authenticate on multiple accounts)

## Article
- id (bigint) (required)
- sourceId (string) (required)
- sourceCreatedAt (Created ISO 8601 timestamp from publisher)
- categoryId (foreign key: Category) (required)
- title (string) (required)
- text (string) (required)
- url (string) (required)
- isAutoModerated (tinyint) (required) (Indicates whether the article is subject to automated moderation rules)
- unprocessedCount (int) (Denormalized count of unprocessed comments (isScored = false))
- unmoderatedCount (int) (Denormalized count of unmoderated comments (isScored = true AND isModerated = false))
- moderatedCount (int) (Denormalized count of moderated comments (isScored = true AND isModerated = true))
- highlightedCount (int) (Denormalize COUNT of comments with highlightedCount > 0)
- approvedCount (int) (Denormalize COUNT of comments with approvedCount > 0)
- rejectedCount (int) (Denormalize COUNT of comments with rejectedCount > 0)
- deferredCount (int) (Denormalize COUNT of comments with deferredCount > 0)
- flaggedCount (int) (Denormalize COUNT of comments with flaggedCount > 0)
- batchedCount (int) (Denormalize COUNT of comments with batchedCount > 0)
- recommendedCount (int) (Denormalize COUNT of comments with recommendedCount > 0)
- disableRules (tinyint) (Whether rule processing is disabled on this article)
- createdAt (datetime)
- modifiedAt (datetime)
- extra (json)

### Indexes
- sourceId (unique)
- categoryId

## ModeratorAssignment
- id (int) (required)
- user (foreign key: User) (required)
- article (foreign key: Article) (required)

### Indexes
- user + article (unique)
- user

## Comment
- id (bigint) (required)
- sourceId (string) (required) (Original id from publisher)
- replyToSourceId (string) (optional foreign key: self.sourceId)
- replyId (number) (id of comment this is a reply to)
- authorSourceId (string) (required) (publisher id of author)
- article (foreign key: Article) (required)
- author (json) (required)
- text (long text) (required)
- isScored (tinyint) (required)
- isModerated (tinyint)
- isAccepted (tinyint)
- isDeferred (tinyint)
- isHighlighted (tinyint)
- isBatchResolved (tinyint)
- isAutoResolved (tinyint) (Indicates if the comment was auto-accepted/rejected based on a rule(s))
- createdAt (datetime) (required) (Created ISO 8601 timestamp from publisher)
- modifiedAt (datetime)
- sentForScoring (datetime)
- sentBackToPublisher (datetime)
- extra (json)

### Indexes
- sourceId (unique)
- isAccepted
- isDeferred
- isHighlighted
- isBatchResolved
- isAutoResolved
- sentForScoring

## CommentSize
- commentId (int) (required)
- width (int) (required)
- height (int) (required)

### Indexes
- commentId, width

## UserCategoryAssignment
- userId (int) (required)
- categoryId (int) (required)

### Indexes
- userId
- categoryId

### Notes
- Used for hasAndBelongsToMany for category assignments on users.

### States
- unscored: sentForScoring == null
- scored: sentForScoring != null && isScored == 1 (set as such when all related `CommentScoreRequest`s `doneAt` fields are set)
- accepted: isAccepted == 1
- rejected: isAccepted == 0
- deferred: isAccepted == null && isDeferred == 1
- highlighted: isAccepted == 1 && isHighlighted == 1

## CommentScoreRequest
- id (bigint)
- comment (foreign key: Comment) (required)
- userId (foreign key: User) (required)
- sentAt (datetime) (required)
- doneAt (datetime)

## CommentScore
- id (bigint)
- commentId (foreign key: Comment)
- sourceType (enum: User, Moderator, Machine) (required)
- sourceId (string) (optional identifier so that scores can be retracted, like for publisher recommendations)
- commentScoreRequestId (foreign key: CommentScoreRequest) (set for "machine" sources)
- score (float) (required) (0 - 1) (these get set to 1 for non-machine sources)
- annotationStart (int)
- annotationEnd (int)
- confirmedUserId (int)
- isConfirmed (tinyint)
- extra (json)
- createdAt (datetime) (required)
- updatedAt (datetime)
- TagId (int) (foreign key: Tags)

### Indexes
- comment

## CommentTopScore
- commentId (foreign key: Comment)
- tagId (foreign key: Tag)
- commentScoreId (foreign key: CommentScore)

### Indexes
- commentId/tagId

## CommentSummaryScore
- commentId (foreign key: Comment)
- tagId (foreign key: Tag)
- score (float) (required)
- confirmedUserId (int)
- isConfirmed (bool)

### Indexes
- commentId/tagId

## CommentRecommendation
- id (bigint)
- commentId (foreign key: Comment)
- sourceId (string) (optional identifier so that scores can be retracted, like for publisher recommendations)
- extra (json)
- createdAt (datetime) (required)
- updatedAt (datetime)

### Indexes
- comment

## CommentFlag
- id (bigint)
- commentId (foreign key: Comment)
- sourceId (string) (optional identifier so that scores can be retracted, like for publisher recommendations)
- extra (json)
- createdAt (datetime) (required)
- updatedAt (datetime)

### Indexes
- comment

## Decision
- id(int) (required)
- commentId (foreign key: Comment) (require)
- userId (foreign key: User) (optional, if source === User)
- moderationRuleId (foreign key: ModerationRule) (optional, if source === Rule)
- status (enum: Accept, Reject, Defer) (required)
- source (enum: User, Rule) (required)
- sentBackToPublisher (datetime)

### Notes

Represents a log of decisions made by OSMod.

## ModerationRule
- id (int) (required)
- tagId (foreign key: Tag) (required)
- categoryId (foreign key: Category)
- lowerThreshold (smallint) (required)
- upperThreshold (smallint) (required)
- action (enum: Approve, Reject, Defer, Highlight) (required)
- createdBy (foreign key: User)

### Indexes
- categoryId

## Category
- id (int) (required)
- label (string) (required)
- isActive (tinyint) (required)
- unprocessedCount (int) (Denormalize SUM of articles' unprocessedCount)
- unmoderatedCount (int) (Denormalize SUM of articles' unmoderatedCount)
- moderatedCount (int) (Denormalize SUM of articles' moderatedCount)
- highlightedCount (int) (Denormalize SUM of articles' highlightedCount)
- approvedCount (int) (Denormalize SUM of articles' approvedCount)
- rejectedCount (int) (Denormalize SUM of articles' rejectedCount)
- deferredCount (int) (Denormalize SUM of articles' deferredCount)
- flaggedCount (int) (Denormalize SUM of articles' flaggedCount)
- batchedCount (int) (Denormalize SUM of articles' batchedCount)
- recommendedCount (int) (Denormalize SUM of articles' recommendedCount)
- extra (json)

### Indexes
- isActive

## CommentReply
- commentId (int) (required)
- replyId (int) (required)

### Indexes
- commentId
- replyId

### Notes
- Used for hasAndBelongsToMany for replies on a comment.

## Tag
- id (int) (required)
- key (string) (required) (raw key for tag, e.g. `ATTACK_ON_COMMENTER`)
- label (string) (required) (display name, e.g. `Attack of Commenter`)
- color (string) (required) (hex color, e.g. `#c0ff33`)
- description (string) (optional) (short description, e.g. `A verbale attack directed towards author`)
- isInBatchView (bool) (is the tag to be shown on the front-end)
- isTaggable (bool) (tags that would show up in reason to reject or moderateor selected tags, but not the tag selector for batch view)

### Indexes
- key (unique)

## Preselect
- id (int) (required)
- tagId (foreign key: Tag)
- categoryId (foreign key: Category)
- lowerThreshold (smallint) (required)
- upperThreshold (smallint) (required)
- createdBy (foreign key: User)

## TaggingSensitivity
- id (int) (required)
- tagId (foreign key: Tag)
- categoryId (foreign key: Category)
- lowerThreshold (smallint) (required)
- upperThreshold (smallint) (required)
- createdBy (foreign key: User)
