import { useEffect, useRef } from "react";

const FormExample = () => {
    const inputRef = useRef(null);
    const renderCount = useRef(0);
    const timerRef = useRef(null);

    useEffect(() => { renderCount.current++; });

    const focusInput = () => inputRef.current.focus();

    const startTimer = () => {
        timerRef.current = setInterval(() => console.log('tick'), 1000);
    };
    const stopTimer = () => clearInterval(timerRef.current);

    return (
        <>
            <input ref={inputRef} />
            <button onClick={focusInput}>Focus</button>
            <p>Renders: {renderCount.current}</p>
        </>
    );
};
export default FormExample;