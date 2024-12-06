import { useRef, useEffect, useState, useContext } from "react";
import { db } from "../appwrite/database";
import DeleteButton from "./DeleteButton";
import Spinner from "../icons/Spinner";
import { setNewOffset, autoGrow, setZIndex, bodyParser } from "../utils";
import { NoteContext } from "../context/NoteContext";

const NoteCard = ({ note }) => {
    const [saving, setSaving] = useState(false);
    const keyUpTimer = useRef(null);

    const { setSelectedNote } = useContext(NoteContext);

    // Safely parse note body and position
    const body = bodyParser(note.body || "");
    const [position, setPosition] = useState({ x: 0, y: 0 });

    // Fallback colors if colors are missing
    const colors = note.colors
        ? JSON.parse(note.colors)
        : {
              colorBody: "#fff",
              colorHeader: "#ccc",
              colorText: "#000",
          };

    const mouseStartPos = useRef({ x: 0, y: 0 });
    const cardRef = useRef(null);
    const textAreaRef = useRef(null);

    useEffect(() => {
        const fetchPosition = async () => {
            try {
                const savedNote = await db.notes.get(note.$id);
                if (savedNote && savedNote.position) {
                    setPosition(JSON.parse(savedNote.position));
                }
            } catch (error) {
                console.error("Error fetching note position:", error);
            }
        };

        fetchPosition();

        
        if (textAreaRef.current) {
            autoGrow(textAreaRef);
        }

        if (cardRef.current) {
            setZIndex(cardRef.current);
        }
    }, [note.$id]);

    const mouseDown = (e) => {
        if (e.target.className === "card-header") {
            mouseStartPos.current.x = e.clientX;
            mouseStartPos.current.y = e.clientY;

            document.addEventListener("mousemove", mouseMove);
            document.addEventListener("mouseup", mouseUp);

            if (cardRef.current) {
                setZIndex(cardRef.current);
            }
            setSelectedNote(note);
        }
    };

    const mouseMove = (e) => {
        const mouseMoveDir = {
            x: mouseStartPos.current.x - e.clientX,
            y: mouseStartPos.current.y - e.clientY,
        };

        mouseStartPos.current.x = e.clientX;
        mouseStartPos.current.y = e.clientY;

        const newPosition = setNewOffset(cardRef.current, mouseMoveDir);
        setPosition(newPosition);
    };

    const mouseUp = () => {
        document.removeEventListener("mousemove", mouseMove);
        document.removeEventListener("mouseup", mouseUp);

        const newPosition = setNewOffset(cardRef.current);
        saveData("position", newPosition);
    };

    const saveData = async (key, value) => {
        const payload = { [key]: JSON.stringify(value) };

        try {
            await db.notes.update(note.$id, payload);
        } catch (error) {
            console.error("Failed to save data:", error);
        }
        setSaving(false);
    };

    const handleKeyUp = () => {
        setSaving(true);

        if (keyUpTimer.current) {
            clearTimeout(keyUpTimer.current);
        }

        keyUpTimer.current = setTimeout(() => {
            if (textAreaRef.current) {
                saveData("body", textAreaRef.current.value);
            }
        }, 2000);
    };

    return (
        <div
            ref={cardRef}
            className="card"
            style={{
                backgroundColor: colors.colorBody,
                left: `${position.x}px`,
                top: `${position.y}px`,
            }}
            onMouseDown={mouseDown}
        >
            <div
                className="card-header"
                style={{ backgroundColor: colors.colorHeader }}
            >
                <DeleteButton noteId={note.$id} />
                {saving && (
                    <div className="card-saving">
                        <Spinner color={colors.colorText} />
                        <span style={{ color: colors.colorText }}>Saving...</span>
                    </div>
                )}
            </div>

            <div className="card-body">
                <textarea
                    onKeyUp={handleKeyUp}
                    ref={textAreaRef}
                    style={{ color: colors.colorText }}
                    defaultValue={body}
                    onInput={() => {
                        if (textAreaRef.current) {
                            autoGrow(textAreaRef.current);
                        }
                    }}
                    onFocus={() => {
                        if (cardRef.current) {
                            setZIndex(cardRef.current);
                        }
                        setSelectedNote(note);
                    }}
                ></textarea>
            </div>
        </div>
    );
};

export default NoteCard;
