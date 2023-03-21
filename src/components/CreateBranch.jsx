import React from "react";
import "../styles/create.css";
import { setDoc, doc } from "firebase/firestore";
import { db } from "../firebase";
import { useState } from "react";
import { v4 } from "uuid";
import List from "./List";
import { names, projects } from "../constants/names";
import dayjs from "dayjs";
import "../styles/btn3.css";
import "../styles/btn7.css";
import "../styles/input.css";

const CreateBranch = ({ close, fetchData, state, setState }) => {
  const [data, setData] = useState({
    author: names[0],
    type: "API",
    project: projects[0],
    link: "",
    reviewer: names.filter((name) => "kate" !== name)[0],
    status: "created",
    id: v4(),
    board: names.filter((name) => "kate" !== name)[0],
    task: "",
    position: "last",
  });

  const updateData = (value, type) => {
    setData((d) => ({ ...d, [type]: value }));
  };

  const createPost = async () => {
    if (data.link.trim() === "" || data.task.trim() === "") {
      alert("Enter link");
      return 1;
    }

    const amount = state[data.reviewer].items.length;

    await setDoc(doc(db, "branches", `${data.id}`), {
      ...data,
      date: dayjs().valueOf(),
      position: amount,
    });

    return null;
  };

  const save = async () => {
    const res = await createPost();
    if (res === null) {
      await fetchData();
      close();
    }
  };

  return (
    <div class="popup-fade">
      <div class="popup">
        <button className="custom-btn1 btn-7" onClick={close}>
          <span>Закрыть</span>
        </button>
        <div className="inputs">
          <List
            names={names}
            label="Author"
            onChange={(v) => updateData(v.target.value, "author")}
          />
          <List
            names={names.filter((name) => data.author !== name)}
            label="Reviewer"
            onChange={(v) => {
              updateData(v.target.value, "reviewer");
              updateData(v.target.value, "board");
            }}
          />

          <List
            names={["API", "Next"]}
            label="Type"
            onChange={(v) => updateData(v.target.value, "type")}
          />
          <List
            names={projects}
            label="Project"
            onChange={(v) => updateData(v.target.value, "project")}
          />

          <div class="text-field">
            <input
              onChange={(v) => updateData(v.target.value, "link")}
              value={data.link}
              class="text-field__input"
              type="text"
              name="login"
              id="login"
              placeholder="GitLab link"
            />
          </div>
          <div class="text-field">
            <input
              onChange={(v) => updateData(v.target.value, "task")}
              value={data.task}
              class="text-field__input"
              type="text"
              name="login"
              id="login"
              placeholder="Feature"
            />
          </div>
        </div>

        <button class="custom-btn btn-3" onClick={save}>
          <span>Save</span>
        </button>
      </div>
    </div>
  );
};

export default CreateBranch;
