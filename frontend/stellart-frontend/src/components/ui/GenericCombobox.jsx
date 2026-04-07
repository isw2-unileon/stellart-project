import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/components/ui/combobox"

export default function GenericCombobox({ options = [], value, onChange, placeholder, className }) {
    return (
        <Combobox
            value={value || null}
            onValueChange={(newValue) => onChange(newValue ?? "")}
            className={className}
        >
            <ComboboxInput
                placeholder={placeholder || "Select an option..."}
                className="[&_input]:bg-slate-50 [&_input]:rounded-xl [&_input]:px-4 [&_input]:py-3 [&_input]:text-slate-700 [&_input]:placeholder-slate-400 rounded-xl border-slate-200 shadow-sm focus-within:bg-white focus-within:ring-2 focus-within:ring-yellow-400 focus-within:border-yellow-400 transition-all h-auto"
            />
            <ComboboxContent className="rounded-xl border-slate-200 shadow-lg">
                <ComboboxEmpty>No items found.</ComboboxEmpty>
                <ComboboxList className="p-1.5">
                    {options.map((item) => (
                        <ComboboxItem
                            key={item.value}
                            value={item.value}
                            textValue={item.label}
                            className="rounded-lg px-3 py-2.5 text-sm text-slate-700 data-highlighted:bg-yellow-50 data-highlighted:text-yellow-700 cursor-pointer"
                        >
                            {item.label}
                        </ComboboxItem>
                    ))}
                </ComboboxList>
            </ComboboxContent>
        </Combobox>
    )
}
