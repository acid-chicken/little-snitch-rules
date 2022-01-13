OUT_DIR=dist
OUT_EXT=.lsrules
SRC_DIR=src
SRC_EXT=.mjs

.PHONY: all clean malware-filter

all: malware-filter

clean:
	rm -rf $(OUT_DIR)

malware-filter: $(OUT_DIR)
	$(SRC_DIR)/malware-filter$(SRC_EXT) $(OUT_DIR)/urlhaus$(OUT_EXT) $(OUT_DIR)/phishing$(OUT_EXT) $(OUT_DIR)/pup$(OUT_EXT)

$(OUT_DIR):
	mkdir -p $(OUT_DIR)
