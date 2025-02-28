import PromptSuggestionButton from "./PromptSuggestionButton"

const PromptSuggestionsRow = ({onPromptClick}) => {
    const prompts = [
        "Who is highest paid F1 driver?",
        "who is the current formula one world driver's champion?",
        "how many times had the current world driver's champion won it?",
        "What happened in f1 today?"
    ]
    return (
        <div className="prompt-suggestion-row">
            {prompts.map((prompt, index)=>
            <PromptSuggestionButton key={`suggestion-${index}`} text={prompt} onClick={() => onPromptClick(prompt)}/> //passing prop upwards using callback function instead of onPromptClick
            )}
        </div>
    )
}

export default PromptSuggestionsRow