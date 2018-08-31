Tom Boutin
Project 2

In order to test the validateChain() method for bad blocks, comment out lines
111-114. This will change the data value (locally within validateBlock()) for
all even blocks.

One thing to note is that this will cause validateBlock() to fail, but in 
validateChain the code is just grabbing and comparing hashes from the levelDB.
So in validateChain it says that the block is good, even though later the code
reports that even numbered blocks had errors.
