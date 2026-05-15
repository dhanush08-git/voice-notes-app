const mongoose = require('mongoose');

const NoteSchema = new mongoose.Schema(
    {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User",required:true },
        transcript: String,
        summary: String,
        actionItems: [String],
    },
    { timestamps: true }
);

module.exports = mongoose.model("Note",NoteSchema);
