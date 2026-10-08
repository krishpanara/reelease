const mongoose = require("mongoose");
const { Schema } = mongoose;
const { addVirtualId } = require("../utils/modelHelper");

const AITaskSchema = new Schema(
  {
    user_id: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: false,
    },
    provider_id: {
      type: Schema.Types.ObjectId,
      ref: "AIProvider",
      required: false,
    },
    service_type: {
      type: String,
      required: true,
    },
    task_id: {
      type: String,
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: ["pending", "running", "completed", "failed"],
      default: "pending",
    },
    result_url: {
      type: String,
      default: null,
    },
    attachment_id: {
      type: Schema.Types.ObjectId,
      ref: "Attachment",
      default: null,
    },
    credits_used: {
      type: Number,
      default: 0,
    },
    payload: {
      type: Schema.Types.Mixed,
      default: {},
    },
    provider_config: {
      type: Schema.Types.Mixed,
      default: {},
    },
    error_message: {
      type: String,
      default: null,
    },
  },
  {
    collection: "ai_tasks",
    timestamps: {
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

addVirtualId(AITaskSchema);

module.exports = mongoose.model("AITask", AITaskSchema);
