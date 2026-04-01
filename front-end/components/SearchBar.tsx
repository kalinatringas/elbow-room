import { Text } from "@react-navigation/elements";
import { useState } from "react"
import { TextInput, TouchableOpacity, Keyboard, TouchableWithoutFeedback, View, FlatList, ScrollView } from "react-native"


const TABS = ["Users", "Posts", "Tags"]

type SearchResult = {
    id: string;
    [key: string]: any;
};

type SearchBarProps = {
    searchInput : string;
    activeTab: string;
    onSubmit: (content: string, tab:string)=>void;
    onTabChange: (tab: string) => void;
    results: SearchResult[];
    onResultSelect: (result: SearchResult, tab: string) => void;
}

export default function SearchBar({searchInput, activeTab, onSubmit, onTabChange, results, onResultSelect}: SearchBarProps){

    const [text, setText] = useState("")
    const [showCategories, setShowCategories] = useState(false);

    function changeText(newText:string){
        setText(newText);
        onSubmit(newText, activeTab);
        if(newText.length > 0) {
            setShowCategories(true);
        } else {
            setShowCategories(false);
        }
    }

    const handleTabPress = (tab: string) => {
        onTabChange(tab);
        if(text.length > 0) {
            onSubmit(text, tab);
        }
    }

    const handleResultPress = (result: SearchResult) => {
        onResultSelect(result, activeTab);
        setText("");
        setShowCategories(false);
    }

    const getResultDisplay = (result: SearchResult, tab: string) => {
        switch(tab) {
            case "Users":
                return result.username || result.name || "Unknown User";
            case "Posts":
                return result.content?.substring(0, 50) + "..." || "Unknown Post";
            case "Tags":
                return result.name || result.tag || "Unknown Tag";
            default:
                return JSON.stringify(result);
        }
    }

    return( 
    <TouchableWithoutFeedback onPress={() => setShowCategories(false)}>
        <View className="flex-col relative">
            <View className="p-2 flex-row w-full">
                <TextInput
                    className="p-3 self-stretch flex-1 bg-white rounded-2xl border-black text-black" 
                    value={text}
                    onChangeText={changeText}
                    placeholder="Search here..."
                    placeholderTextColor="#a1a1aa"
                />
                <TouchableOpacity className="ml-2 bg-indigo-300 rounded-2xl justify-center p-3"
                    onPress={() => {
                        if(text.length > 0) onSubmit(text, activeTab);
                    }}
                >
                    <Text className="text-white font-bold">Go</Text>
                </TouchableOpacity>
            </View>

            {showCategories && text.length > 0 && (
                <View className="absolute top-16 left-2 right-2 bg-white border border-gray-300 rounded-lg shadow-lg z-50">
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} className="border-b border-gray-200">
                        <View className="flex-row p-2">
                            {TABS.map((tab) => (
                                <TouchableOpacity
                                    key={tab}
                                    onPress={() => handleTabPress(tab)}
                                    className={`px-4 py-2 rounded-full mr-2 ${activeTab === tab ? 'bg-indigo-400' : 'bg-gray-200'}`}
                                >
                                    <Text className={activeTab === tab ? 'text-white font-bold' : 'text-gray-800'}>
                                        {tab}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </ScrollView>

                    <View className="max-h-80">
                        {results.length > 0 ? (
                            <FlatList
                                data={results}
                                keyExtractor={(item) => item.id.toString()}
                                scrollEnabled={false}
                                renderItem={({item}) => (
                                    <TouchableOpacity
                                        onPress={() => handleResultPress(item)}
                                        className="border-b border-gray-100 py-3 px-4"
                                    >
                                        <Text className="text-gray-800 font-semibold">
                                            {getResultDisplay(item, activeTab)}
                                        </Text>
                                    </TouchableOpacity>
                                )}
                            />
                        ) : (
                            <View className="py-4 px-4">
                                <Text className="text-gray-500 text-center">No results found</Text>
                            </View>
                        )}
                    </View>
                </View>
            )}
        </View>
    </TouchableWithoutFeedback>)
}