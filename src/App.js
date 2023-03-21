import React, { useEffect, useState } from "react";
import "./styles/App.css";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import _ from "lodash";
import {
  collection,
  getDocs,
  deleteDoc,
  doc,
  setDoc,
} from "firebase/firestore";
import { db } from "./firebase";
import Header from "./components/Header";
import dayjs from "dayjs";
import Spinner from "./components/Spinner";

function App() {
  const [state, setState] = useState({
    kate: {
      title: "kate",
      items: [],
    },
    max: {
      title: "max",
      items: [],
    },
    alex: {
      title: "alex",
      items: [],
    },
  });

  const [showCreate, setShowCreate] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const fetchData = async () => {
    setIsLoading(true);
    //getting docs
    const branches = await collection(db, "branches");
    const branchesDocs = await getDocs(branches);
    const branchesData = branchesDocs.docs.map((doc) => doc.data());

    let kateArr = branchesData.filter((obj) => obj.board === "kate");
    kateArr.sort((a, b) => a.position - b.position);
    kateArr.forEach((el, idx) => (el.position = idx));

    let maxArr = branchesData.filter((obj) => obj.board === "max");
    maxArr.sort((a, b) => a.position - b.position);
    maxArr.forEach((el, idx) => (el.position = idx));

    let alexArr = branchesData.filter((obj) => obj.board === "alex");
    alexArr.sort((a, b) => a.position - b.position);
    alexArr.forEach((el, idx) => (el.position = idx));

    setState((prevState) => ({
      kate: {
        ...prevState.kate,
        items: kateArr,
      },
      max: {
        ...prevState.max,
        items: maxArr,
      },
      alex: {
        ...prevState.alex,
        items: alexArr,
      },
    }));
    setIsLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDragEnd = async ({ destination, source }) => {
    if (!destination) {
      return;
    }

    if (
      destination.index === source.index &&
      destination.droppableId === source.droppableId
    ) {
      return;
    }

    // Creating a copy of item before removing it from state
    const itemCopy = {
      ...state[source.droppableId].items[source.index],
    };

    if (
      itemCopy.reviewer !== destination.droppableId &&
      itemCopy.author !== destination.droppableId
    ) {
      alert("not here");
      return;
    }

    let id1;
    let id2;
    //if changing position within the boards
    if (destination.droppableId === source.droppableId) {
      const prev = { ...state };
      //saving ids of switching elemens to update its position in state and in firebase
      id1 = prev[destination.droppableId].items[destination.index].id;
      id2 = prev[destination.droppableId].items[source.index].id;
      //swap
      const temp =
        prev[destination.droppableId].items[destination.index].position;

      prev[destination.droppableId].items[destination.index].position =
        prev[destination.droppableId].items[source.index].position;

      prev[destination.droppableId].items[source.index].position = temp;

      //sort after changing position property
      const sorted = sortItems(prev[destination.droppableId].items);

      setState((prev) => {
        prev = { ...prev };
        prev[destination.droppableId].items = sorted;
        return prev;
      });

      await updateBoard2(id1, id2, destination.droppableId, prev);
    } else {
      setState((prev) => {
        prev = { ...prev };

        // Remove from previous items array
        prev[source.droppableId].items.splice(source.index, 1);

        // Adding to new items array location
        itemCopy.position = destination.index;

        const sorted = sortItems(prev[destination.droppableId].items);

        prev[destination.droppableId].items = sorted;
        prev[destination.droppableId].items.splice(destination.index, 0, {
          ...itemCopy,
          board: destination.droppableId,
        });

        return prev;
      });
      await updateBoard(itemCopy.id, destination.droppableId);
    }
  };

  const sortItems = (arr) => {
    arr.sort((a, b) => a.position - b.position);
    // arr.forEach((el, idx) => (el.position = idx));
    return arr;
  };

  const deleteTask = async (id) => {
    await deleteDoc(doc(db, "branches", id));
    await fetchData();
  };

  const updateBoard = async (id, board) => {
    const data = state[board].items.find((el) => el.id === id);
    await setDoc(doc(db, "branches", `${id}`), {
      ...data,
      date: dayjs().valueOf(),
    });
    await fetchData();
  };

  const updateBoard2 = async (id, id2, board) => {
    const data = state[board].items.find((el) => el.id === id);
    const data2 = state[board].items.find((el) => el.id === id2);
    await setDoc(doc(db, "branches", `${id}`), {
      ...data,
      date: dayjs().valueOf(),
    });
    await setDoc(doc(db, "branches", `${id2}`), {
      ...data2,
      date: dayjs().valueOf(),
    });
  };

  return (
    <div className="App">
      <Header
        showCreate={showCreate}
        setShowCreate={setShowCreate}
        fetchData={fetchData}
        state={state}
        setState={setState}
      />
      {isLoading && (
        <div className="spinnerStyle">
          <Spinner />
        </div>
      )}
      <div className="container">
        <DragDropContext onDragEnd={handleDragEnd}>
          {_.map(state, (data, key) => {
            return (
              <div key={key} className={"column"}>
                <h3 className="name">{data.title}</h3>
                <Droppable droppableId={key}>
                  {(provided, snapshot) => {
                    return (
                      <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className={"droppable-col"}
                      >
                        {data.items.length > 0 &&
                          data.items.map((el, index) => {
                            return (
                              <Draggable
                                key={el.id}
                                index={index}
                                draggableId={el.id}
                              >
                                {(provided, snapshot) => {
                                  return (
                                    <div
                                      className={`item ${
                                        snapshot.isDragging && "dragging"
                                      }`}
                                      ref={provided.innerRef}
                                      {...provided.draggableProps}
                                      {...provided.dragHandleProps}
                                    >
                                      <div
                                        style={{
                                          display: "flex",
                                          flexDirection: "column",
                                        }}
                                      >
                                        <div
                                          className="deleteBtn"
                                          onClick={() => deleteTask(el.id)}
                                        >
                                          X
                                        </div>

                                        <div
                                          style={{ display: "flex" }}
                                          className="panel"
                                        >
                                          <div className="df">
                                            <a href={el.link} target="_blanck">
                                              {el.project + "-" + el.type}
                                            </a>
                                            <p>
                                              Author: <span>{el.author}</span>
                                            </p>
                                            <p>
                                              Reviewer:{" "}
                                              <span>{el.reviewer}</span>
                                            </p>
                                          </div>
                                        </div>
                                        <div className="panel">{el.task}</div>
                                        <div
                                          className="panel"
                                          style={{ display: "flex" }}
                                        >
                                          <p>
                                            {dayjs(el.date).format(
                                              "DD/MM/YYYY HH:mm"
                                            )}
                                          </p>
                                          <p>
                                            {el.board === el.reviewer
                                              ? "Можно смотреть"
                                              : "Правки в реквесте"}
                                          </p>
                                        </div>
                                      </div>
                                    </div>
                                  );
                                }}
                              </Draggable>
                            );
                          })}
                        {provided.placeholder}
                      </div>
                    );
                  }}
                </Droppable>
              </div>
            );
          })}
        </DragDropContext>
      </div>
    </div>
  );
}

export default App;
