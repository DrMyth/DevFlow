import { create } from "zustand";
import { LANGUAGE_CONFIG } from "../lib/utils";
import { Monaco } from "@monaco-editor/react";
import { CodeEditorState } from "../types";
import { editor } from './../../node_modules/monaco-editor/esm/vs/editor/editor.api';

const getInitialState = () => {
    if(typeof window === "undefined"){
        return {
            language: "javascript",
            fontSize: 16,
            theme: "vs-dark",
        }
    }
    const savedLanguage = localStorage.getItem("editor-language") || "javascript";
    const savedFontSize = localStorage.getItem("editor-font-size") || 16;
    const savedTheme = localStorage.getItem("editor-theme") || "vs-dark";

    return {
        language: savedLanguage,
        fontSize: Number(savedFontSize),
        theme: savedTheme,
    }
}

export const useCodeEditorStore = create<CodeEditorState>((set, get)=>{
    const initialState = getInitialState();
    return {
        ...initialState, 
        output: "",
        isRunning: false,
        error: null,
        editor: null,
        executionResult: null,

        getCode: () => get().editor?.getValue() || "",

        setEditor: (editor: Monaco) => {
            const savedCode = localStorage.getItem(`editor-code-${get().language}`) || "";
            if(savedCode) editor.setValue(savedCode);

            set({editor});
        },

        setTheme: (theme: string) => {
            localStorage.setItem("editor-theme", theme);
            set({theme});
        },

        setFontSize: (fontSize: number) => {
            localStorage.setItem("editor-font-size", fontSize.toString());
            set({fontSize});
        },

        setLanguage: (language: string) => {
            // Save current language code before switching
            const currentCode = get().editor?.getValue();
            if (currentCode) {
              localStorage.setItem(`editor-code-${get().language}`, currentCode);
            }
      
            localStorage.setItem("editor-language", language);
      
            set({
              language,
              output: "",
              error: null,
            });
        },

        runCode: async () => {
            const {language, getCode} = get()
            const code = getCode();

            if(!code) {
                set({error: "Please write some code to run"});
                return;
            }

            set({isRunning: true, error: null, output: ""});

            try {
                const runtime = LANGUAGE_CONFIG[language].pistonRuntime;
                const response = await fetch("https://emkc.org/api/v2/piston/execute", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        language: runtime.language,
                        version: runtime.version,
                        files: [
                            {
                                name: "main",
                                content: code,
                            }
                        ],
                    }),
                })

                const data = await response.json();
                console.log("Data from piston: ", data);

                //Handle API Level errors
                if(data.message){
                    set({error: data.message, executionResult: {code, output: "", error: data.message}});
                    return;
                }

                //Handle compilation errors
                if(data.compile && data.compile.code !== 0){
                    const error = data.compile.stderr || data.compile.output;
                    console.log("Compilation error: ", error);
                    set({error, executionResult: {code, output: "", error}});
                    return;
                }

                //Handle runtime errors
                if(data.run && data.run.code !== 0){
                    const error = data.run.stderr || data.run.output;
                    console.log("Runtime error: ", error);
                    set({error, executionResult: {code, output: "", error}});
                    return;
                }

                //Handle successful
                const output = data.run.output;
                console.log("Output: ", output);
                set({output: output.trim(), error: null, executionResult: {code, output: output.trim(), error: null}});

            } catch(e) {
                console.log("Error running code: ", e);
                set({error: "Error running code", executionResult: {code, output: "", error: "Error running code"}});
            } finally {
                set({isRunning: false});
            }
        }
    }
})

export const getExecutionResult = () => useCodeEditorStore.getState().executionResult;
