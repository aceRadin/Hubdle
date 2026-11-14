"""Gera o catálogo local do Pokédle com dados públicos da PokéAPI e TCGdex."""
import csv
import io
import json
from pathlib import Path
import re
import urllib.request
from concurrent.futures import ThreadPoolExecutor

ROOT = Path(__file__).resolve().parents[1]
SOURCE = "https://raw.githubusercontent.com/PokeAPI/pokeapi/master/data/v2/csv/"


def fetch(url):
    with urllib.request.urlopen(url, timeout=90) as response:
        return response.read().decode("utf-8")


def table(name):
    return list(csv.DictReader(io.StringIO(fetch(SOURCE + name + ".csv"))))


def main():
    names = ["pokemon_species", "pokemon", "pokemon_types", "types",
             "pokemon_colors", "pokemon_habitats", "pokemon_species_names",
             "pokemon_species_flavor_text"]
    with ThreadPoolExecutor(max_workers=4) as pool:
        tables = dict(zip(names, pool.map(table, names)))
    species = {int(row["id"]): row for row in tables["pokemon_species"]}
    english = {int(row["pokemon_species_id"]): row["name"]
               for row in tables["pokemon_species_names"] if row["local_language_id"] == "9"}
    mentions = re.compile(r"(?<!\w)(?:" + "|".join(
        re.escape(name) for name in sorted(english.values(), key=len, reverse=True)
    ) + r")(?!\w)", re.IGNORECASE)
    descriptions = {}
    for row in tables["pokemon_species_flavor_text"]:
        text = re.sub(r"\s+", " ", row["flavor_text"]).strip()
        if row["language_id"] == "9" and not mentions.search(text):
            descriptions[int(row["species_id"])] = text
    lookup = {name: {row["id"]: row["identifier"] for row in tables[name]}
              for name in ["types", "pokemon_colors", "pokemon_habitats"]}
    types = {}
    for row in tables["pokemon_types"]:
        types.setdefault(int(row["pokemon_id"]), {})[row["slot"]] = lookup["types"][row["type_id"]]
    def stage(identifier):
        parent = species[identifier]["evolves_from_species_id"]
        return 1 + stage(int(parent)) if parent else 1
    roster = []
    for row in tables["pokemon"]:
        if row["is_default"] != "1":
            continue
        identifier = int(row["species_id"])
        entry = species[identifier]
        pokemon_types = types[int(row["id"])]
        roster.append({
            "id": identifier, "name": english[identifier],
            "type1": pokemon_types["1"], "type2": pokemon_types.get("2"),
            "generation": int(entry["generation_id"]),
            "color": lookup["pokemon_colors"][entry["color_id"]],
            "stage": stage(identifier),
            "height": int(row["height"]), "weight": int(row["weight"]),
            "habitat": lookup["pokemon_habitats"].get(entry["habitat_id"]),
            "description": descriptions.get(identifier),
            "portrait": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/" + row["id"] + ".png",
            "cards": []
        })
    by_name = {row["name"].casefold(): row for row in roster}
    for set_id in ["base1", "base2", "base3", "xy1", "sv01"]:
        card_set = json.loads(fetch("https://api.tcgdex.net/v2/en/sets/" + set_id))
        for card in card_set["cards"]:
            pokemon = by_name.get(card["name"].casefold())
            if pokemon and card.get("image"):
                pokemon["cards"].append({"id": card["id"], "image": card["image"] + "/high.webp"})
    roster.sort(key=lambda row: row["id"])
    assert len(roster) >= 1025 and len({row["id"] for row in roster}) == len(roster)
    assert all(not mentions.search(row["description"]) for row in roster if row["description"])
    output = ROOT / "jogos/pokedle"
    output.mkdir(parents=True, exist_ok=True)
    temporary = output / "pokemon.js.tmp"
    catalog = json.dumps(roster, ensure_ascii=False, separators=(",", ":"))
    temporary.write_text("window.HUBA_POKEDEX = " + catalog + ";\n", encoding="utf-8")
    temporary.replace(output / "pokemon.js")
    print(json.dumps({"species": len(roster), "descriptions": sum(bool(p["description"]) for p in roster),
                      "card_species": sum(bool(p["cards"]) for p in roster)}))


if __name__ == "__main__":
    main()
