export const deleteComments = ( _id ) => {
    Comment.findOneAndDelete({ _id })
        .then(comment => {
            if (comment.parent) {
                Comment.findOneAndUpdate({ _id: comment.parent }, { $pull: { children: _id } })
                    .then(data => console.log("comment delete from parent"))
                    .catch(error => console.log(error))
            }

            Notification.findOneAndDelete({ comment: _id }).then(notification => console.log("comment notification deleted"))
            Notification.findOneAndDelete({ reply: _id }).then(notification => console.log("reply notification deleted"))
            
            Blog.findOneAndUpdate({ _id: comment.blog_id }, { $pull: { comments: _id }, $inc: { "activity.total_comments": -1 }, "activity.total_parent_comments": comment.parent ? 0 : -1 }    )
                .then(blog => {
                    if (comment.children.length) {
                        comment.children.map(replies => {
                            deleteComments(replies);
                        })
                    }
                })

        })
        .catch(error => {
            console.log(error.message);
        })
}