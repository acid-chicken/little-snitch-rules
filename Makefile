OUT_DIR=dist
OUT_EXT=.lsrules
SRC_DIR=src
SRC_EXT=.mjs

.PHONY: all clean

all: $(OUT_DIR)/urlhaus$(OUT_EXT)

clean:
	rm -rf $(OUT_DIR)

$(OUT_DIR)/urlhaus$(OUT_EXT): $(OUT_DIR)
	$(SRC_DIR)/urlhaus$(SRC_EXT) > $(OUT_DIR)/urlhaus$(OUT_EXT)

$(OUT_DIR):
	mkdir -p $(OUT_DIR)
